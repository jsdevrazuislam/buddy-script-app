import { Router } from 'express';

import authRoutes from '../modules/auth/auth.route';
import commentRoutes from '../modules/comment/comment.route';
import likeRoutes from '../modules/like/like.route';
import postRoutes from '../modules/post/post.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);

export default router;
