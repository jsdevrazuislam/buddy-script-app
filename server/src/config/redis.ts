import dotenv from 'dotenv';
import Redis from 'ioredis';

import { logger } from '../utils/logger';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null, // Critical for BullMQ
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

export const connectRedis = async () => {
  // ioredis connects automatically, but we can check if it's ready
  if (redis.status === 'ready' || redis.status === 'connecting') {
    return;
  }
  await redis.connect();
};

export default redis;
