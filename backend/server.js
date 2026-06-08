/**
 * AdastraSky Backend - Server Principal
 * Plataforma de astroturismo premium para las Islas Canarias
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

// ============================================================
// INIT APP (IMPORTANTE: PRIMERO)
// ============================================================

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Render / Proxy fix
app.set('trust proxy', 1);

// ============================================================
// PATHS
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

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

// ============================================================
// CORS
// ============================================================

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================
// RATE LIMIT (FIXED PROXY READY)
// ============================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: 'Demasiadas peticiones. Intenta más tarde.',
  },
});

app.use('/api/', limiter);

// ============================================================
// LOGGING
// ============================================================

app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// ============================================================
// BODY PARSING
// ============================================================

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// HEALTH CHECK
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
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ============================================================
// API INFO
// ============================================================

app.get('/api', (req, res) => {
  res.json({
    name: 'AdastraSky API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      sky: '/api/sky',
      admin: '/api/admin',
      chat: '/api/chat',
      islands: '/api/islands',
      events: '/api/events',
      weather: '/api/weather',
    },
  });
});

// ============================================================
// SWAGGER (DEV ONLY)
// ============================================================

if (NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => {
    res.json(swaggerSpec);
  });
}

// ============================================================
// ROUTES
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/sky', skyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/islands', islandRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/experiences', experienceRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// ERROR HANDLERS
// ============================================================

app.use(notFound);
app.use(errorHandler);

// ============================================================
// SERVER START
// ============================================================

async function startServer() {
  try {
    if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET obligatorio en producción');
    }

    console.log('🔌 Conectando a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado');

    // SOLO EN DESARROLLO (NO ROMPE PRODUCCIÓN)
    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }

    app.listen(PORT, () => {
      console.log(`
🌌 AdastraSky Backend running
➡️ Port: ${PORT}
➡️ Env: ${NODE_ENV}
➡️ Health: /health
➡️ API: /api
      `);
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGTERM', async () => {
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await sequelize.close();
  process.exit(0);
});

// ============================================================
// START
// ============================================================

if (NODE_ENV !== 'test') {
  startServer();
}

export default app;