import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import sequelize from './config/database';
import { reactionQueue, commentQueue } from './config/queue';
import { connectRedis } from './config/redis';
import { initSocket } from './config/socket';
import swaggerOptions from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import './models'; // Initialize associations
import routes from './routes';
import { logger } from './utils/logger';
import './workers/comment.worker';
import './workers/reaction.worker';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

// Logging
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }),
);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Swagger Setup — spec is defined entirely in src/config/swagger.ts
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/api/v1', routes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server

const startServer = async () => {
  try {
    // Database connection
    await sequelize.authenticate();
    logger.info('Database Connection established successfully.');

    // Sync models
    if (process.env.NODE_ENV === 'development') {
      const alterSchema = process.env.DB_SYNC_ALTER === 'true';
      logger.info(`Syncing Database Models (alter=${alterSchema})...`);
      await sequelize.sync({ alter: alterSchema });
    }

    // Initialize Socket Server with app
    const { httpServer } = initSocket(app);

    // Redis connection
    try {
      await connectRedis();

      // Schedule repeatable jobs for batch processing (every 5 seconds)
      await reactionQueue.add(
        'process-reactions',
        {},
        {
          repeat: { every: 5000 },
        },
      );
      await commentQueue.add(
        'process-comments',
        {},
        {
          repeat: { every: 5000 },
        },
      );
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
