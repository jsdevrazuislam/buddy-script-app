import { Router } from 'express';

import { applyAuthLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as authController from './auth.controller';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.validation';

const router = Router();

// Strict rate limiting on auth endpoints — 10 requests per 15 minutes per IP
router.post('/register', applyAuthLimiter, validate(registerSchema), authController.register);
router.post('/login', applyAuthLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(logoutSchema), authController.logout);

export default router;
