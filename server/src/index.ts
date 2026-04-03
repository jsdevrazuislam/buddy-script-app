import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import sequelize from './config/database';
import { reactionQueue, commentQueue } from './config/queue';
import { connectRedis } from './config/redis';
import { initSocket } from './config/socket';
import swaggerOptions from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { sanitizeInputs } from './middlewares/sanitize.middleware';
import './models'; // Initialize associations
import routes from './routes';
import { logger } from './utils/logger';
import './workers/comment.worker';
import './workers/reaction.worker';

dotenv.config();

// ─── Production Secret Validation ────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DB_URL', 'REDIS_HOST'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    logger.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const app: Express = express();
const port = process.env.PORT || 9000;

// ─── CORS Whitelist ───────────────────────────────────────────────────────────
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://buddy-script-app.vercel.app']
    : [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001'];

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet — hide server fingerprint, set strict security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", ...allowedOrigins],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Swagger UI to load external assets
  }),
);

// CORS — only allow whitelisted origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body size limit — prevent JSON bomb / oversized payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// XSS sanitisation — strips malicious HTML/JS from req.body and req.params
// Uses a custom Express 5-compatible sanitizer (xss-clean crashes on Express 5)
app.use(sanitizeInputs);

// HTTP Parameter Pollution — prevents duplicate query params attacks
app.use(hpp());

// ─── Logging ─────────────────────────────────────────────────────────────────
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }),
);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// ─── Swagger (dev/staging only) ───────────────────────────────────────────────
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Centralised Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Server Bootstrap ────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database Connection established successfully.');

    if (process.env.NODE_ENV === 'development') {
      const alterSchema = process.env.DB_SYNC_ALTER === 'true';
      logger.info(`Syncing Database Models (alter=${alterSchema})...`);
      await sequelize.sync({ alter: alterSchema });
    }

    const { httpServer } = initSocket(app);

    try {
      await connectRedis();

      await reactionQueue.add('process-reactions', {}, { repeat: { every: 5000 } });
      await commentQueue.add('process-comments', {}, { repeat: { every: 5000 } });
      logger.info('Batch processing jobs scheduled.');
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without cache:', redisError);
    }

    httpServer.listen(port, () => {
      logger.info(`Server is running at http://localhost:${port}`);
      logger.info(`API Docs available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
