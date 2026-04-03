import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware';
import { applyGeneralLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as likeController from './like.controller';
import { toggleLikeSchema } from './like.validation';

const router = Router();

router.use(protect);

// General rate limit — 100 requests per minute per user
router.post('/toggle', applyGeneralLimiter, validate(toggleLikeSchema), likeController.toggleLike);
router.get('/', likeController.getLikers);

export default router;
