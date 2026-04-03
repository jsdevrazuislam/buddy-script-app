import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as commentController from './comment.controller';
import { createCommentSchema, createReplySchema } from './comment.validation';

const router = Router();

router.use(protect);

router.post('/', validate(createCommentSchema), commentController.createComment);
router.post('/:id/replies', validate(createReplySchema), commentController.createReply);
router.get('/post/:postId', commentController.getPostComments);

export default router;
