import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerOptions from './config/swagger';

import sequelize from './config/database';
import './models'; // Initialize associations
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

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
app.get('/health', (req: Request, res: Response) => {
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

    // Sync models (in production use migrations instead)
    if (process.env.NODE_ENV === 'development') {
      logger.info('Syncing Database Models...');
      await sequelize.sync({ alter: true });
    }

    // Redis connection (Optional for dev)
    try {
      await connectRedis();
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without cache:', redisError);
    }

    app.listen(port, () => {
      logger.info(`Server is running at http://localhost:${port}`);
      logger.info(`API Docs available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
