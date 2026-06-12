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
// INIT APP
// ============================================================

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
// SECURITY
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
// RATE LIMIT
// ============================================================

app.use('/api/', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ============================================================
// LOGS
// ============================================================

app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// ============================================================
// BODY PARSER
// ============================================================

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// HEALTH
// ============================================================

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database unavailable'
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
    environment: NODE_ENV
  });
});

// ============================================================
// SWAGGER
// ============================================================

if (NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
// START SERVER
// ============================================================

async function startServer() {
  try {
    if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET obligatorio en producción');
    }

    console.log('🔌 Conectando a PostgreSQL...');

    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado');

    // 🔥 CLAVE: crear tablas SIEMPRE (fix del error users)
    await sequelize.sync();

    // Auto-seed: crear usuarios por defecto si la tabla está vacía
    const { default: UserModel } = await import('./src/models/User.js');
    const userCount = await UserModel.count();
    if (userCount === 0) {
      const bcryptMod = await import('bcryptjs');
      const bcrypt = bcryptMod.default;
      const adminPw = process.env.SEED_ADMIN_PASSWORD;
      const demoPw = process.env.SEED_DEMO_PASSWORD;
      if (!adminPw || !demoPw) {
        console.log('⚠️  SEED_ADMIN_PASSWORD y SEED_DEMO_PASSWORD requeridos para auto-seed');
        return;
      }
      const hash = await bcrypt.hash(adminPw, 10);
      await UserModel.create({ email: 'admin@adastra.sky', password: hash, role: 'admin', first_name: 'Admin', last_name: 'AdAstra', preferred_language: 'es' });
      const hashDemo = await bcrypt.hash(demoPw, 10);
      await UserModel.create({ email: 'demo@adastra.sky', password: hashDemo, role: 'user', first_name: 'Demo', last_name: 'User', preferred_language: 'es' });
      console.log('🧑‍💻 Usuarios semilla creados (admin/demo)');
    }

    console.log('🧱 Tablas sincronizadas');

    app.listen(PORT, () => {
  console.log(`
🌌 AdastraSky Backend running
➡️ Port: ${PORT}
➡️ Env: ${NODE_ENV}
➡️ API: /api
  `);

  // Warm-up del ai-service para evitar cold start
  if (process.env.AI_SERVICE_URL) {
    import('axios').then(({ default: axios }) => {
      axios.get(`${process.env.AI_SERVICE_URL}/health`, { timeout: 30000 })
        .then(() => console.log('🤖 AI Service warm-up OK'))
        .catch(() => console.log('⚠️ AI Service dormido, se despertará con la primera petición'));
    });
  }
});

  } catch (error) {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
}

// ============================================================
// SHUTDOWN
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
// INIT
// ============================================================

if (NODE_ENV !== 'test') {
  startServer();
}

export default app;