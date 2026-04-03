import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware';
import { applyPostCreationLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as postController from './post.controller';
import { createPostSchema, getFeedSchema } from './post.validation';

const router = Router();

router.use(protect); // All post routes require authentication

// Moderate rate limit on post creation — 20 posts per hour per user
router.post('/', applyPostCreationLimiter, validate(createPostSchema), postController.createPost);
router.get('/', validate(getFeedSchema), postController.getFeed);
router.get('/upload-url', postController.getUploadUrl);
router.get('/:id', postController.getPost);

export default router;
