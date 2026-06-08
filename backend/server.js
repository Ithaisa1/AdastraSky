/**
 * AdastraSky Backend - Server Principal
 * Plataforma de astroturismo premium para las Islas Canarias
 * 
 * Arquitectura: Node.js + Express + PostgreSQL
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger.js';
import sequelize from './src/config/database.js';
import './src/models/index.js';
import errorHandler from './src/middleware/errorHandler.js';
import notFound from './src/middleware/notFound.js';

import authRoutes from './src/routes/auth.routes.js';
import skyRoutes from './src/routes/sky.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import islandRoutes from './src/routes/island.routes.js';
import contactRoutes from './src/routes/contact.routes.js';
import eventsRoutes from './src/routes/events.routes.js';
import weatherRoutes from './src/routes/weather.routes.js';
import experienceRoutes from './src/routes/experiences.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// Seguridad HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      connectSrc: ["'self'", process.env.AI_SERVICE_URL || "http://localhost:8001"],
    },
  },
}));

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    code: 429,
    message: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// RUTAS DE SALUD Y DIAGNÓSTICO
// ============================================================

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      service: 'AdastraSky Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      aiService: process.env.AI_SERVICE_URL || 'http://localhost:8001',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'AdastraSky Backend',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    name: 'AdastraSky API',
    version: '1.0.0',
    description: 'API principal de la plataforma de astroturismo premium para las Islas Canarias',
    environment: NODE_ENV,
      endpoints: {
        auth: '/api/auth',
        sky: '/api/sky',
        admin: '/api/admin',
        chat: '/api/chat',
        islands: '/api/islands',
        events: '/api/events',
      },
    documentation: '/docs/api_specification.md',
  });
});

// ============================================================
// SWAGGER DOCS
// ============================================================

if (NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AdAstra Sky API Docs',
  }));

  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });
}

// ============================================================
// RUTAS DE LA APLICACIÓN
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/sky', skyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/islands', islandRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  }
}));
app.use('/api/experiences', experienceRoutes);

// ============================================================
// MIDDLEWARES DE ERROR
// ============================================================

app.use(notFound);
app.use(errorHandler);

// ============================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================

async function startServer() {
  try {
    // Validar JWT_SECRET en producción
    if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET es obligatorio en producción. Configúralo en las variables de entorno.');
    }

    // Verificar conexión a PostgreSQL
    console.log('🔌 Conectando a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');

    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║       🌌  AdastraSky Backend Server  🌌                      ║
║                                                              ║
║       Puerto:          ${PORT}                                ║
║       Entorno:         ${NODE_ENV.padEnd(35)}║
║       Base de datos:   PostgreSQL (Sequelize)                ║
║       Health check:    http://localhost:${PORT}/health         ║
║       API info:        http://localhost:${PORT}/api            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Solo iniciar servidor si no estamos en test
if (NODE_ENV !== 'test') {
  startServer();
}

export default app;