import { createServer } from 'http';

import { createAdapter } from '@socket.io/redis-adapter';
import { Express } from 'express';
import { Server } from 'socket.io';

import User from '../models/user.model';
import { logger } from '../utils/logger';
import { verifyAccessToken } from '../utils/token';

import redis from './redis';

let io: Server;

export const initSocket = (app: Express) => {
  const httpServer = createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Redis Adapter for Horizontal Scalability
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      logger.error('Socket Auth Error:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`User connected: ${user.firstName} ${user.lastName} (${socket.id})`);

    // Basic Room management
    socket.on('join_post', (postId: string) => {
      socket.join(`post:${postId}`);
      logger.debug(`Socket ${socket.id} joined room post:${postId}`);
    });

    socket.on('leave_post', (postId: string) => {
      socket.leave(`post:${postId}`);
      logger.debug(`Socket ${socket.id} left room post:${postId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  return { httpServer, io };
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
