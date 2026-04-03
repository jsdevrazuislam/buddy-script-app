import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as postController from './post.controller';
import { createPostSchema, getFeedSchema } from './post.validation';

const router = Router();

router.use(protect); // All post routes require authentication

router.post('/', validate(createPostSchema), postController.createPost);
router.get('/', validate(getFeedSchema), postController.getFeed);
router.get('/upload-url', postController.getUploadUrl);
router.get('/:id', postController.getPost);

export default router;
