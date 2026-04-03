import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware';
import { applyGeneralLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as commentController from './comment.controller';
import { createCommentSchema, createReplySchema } from './comment.validation';

const router = Router();

router.use(protect);

// General rate limit on write operations — 100 requests per minute per user
router.post(
  '/',
  applyGeneralLimiter,
  validate(createCommentSchema),
  commentController.createComment,
);
router.post(
  '/:id/replies',
  applyGeneralLimiter,
  validate(createReplySchema),
  commentController.createReply,
);
router.get('/post/:postId', commentController.getPostComments);

export default router;
