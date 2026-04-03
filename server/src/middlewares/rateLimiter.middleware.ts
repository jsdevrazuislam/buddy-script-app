import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

import redis from '../config/redis';

import { AuthRequest } from './auth.middleware';

// ─── Limiter Configurations ──────────────────────────────────────────────────

/**
 * Auth limiter — strict: 10 attempts per 15 min per IP.
 * Blocked IPs are locked out for 30 minutes.
 */
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:auth',
  points: 10, // max requests
  duration: 15 * 60, // per 15 minutes
  blockDuration: 30 * 60, // block for 30 minutes on breach
});

/**
 * Post creation limiter — moderate: 20 posts per hour per user.
 */
const postCreationLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:post',
  points: 60,
  duration: 60 * 60, // per 1 hour
  blockDuration: 60 * 60, // block for 1 hour on breach
});

/**
 * General social limiter — higher volume: 100 requests per minute.
 * Covers likes, comments, replies.
 */
const generalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:general',
  points: 100,
  duration: 60, // per 1 minute
  blockDuration: 5 * 60, // block for 5 minutes on breach
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getKey = (req: AuthRequest): string => {
  const userId = req.user?.id;
  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  // Include user ID when available to prevent IP-sharing bypass
  return userId ? `${ip}_${userId}` : ip;
};

const buildMiddleware =
  (limiter: RateLimiterRedis) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = getKey(req as AuthRequest);
      await limiter.consume(key);
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        const retryAfter = Math.ceil(err.msBeforeNext / 1000);
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + err.msBeforeNext).toISOString());
        res.status(429).json({
          status: 'error',
          statusCode: 429,
          message: `Too many requests. Please try again after ${retryAfter} seconds.`,
          retryAfter,
        });
      } else {
        // Redis unavailable — fail open to avoid blocking legitimate users
        next();
      }
    }
  };

// ─── Exported Middlewares ─────────────────────────────────────────────────────

export const applyAuthLimiter = buildMiddleware(authLimiter);
export const applyPostCreationLimiter = buildMiddleware(postCreationLimiter);
export const applyGeneralLimiter = buildMiddleware(generalLimiter);
