import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

import * as likeController from './like.controller';
import { toggleLikeSchema } from './like.validation';

const router = Router();

router.use(protect);

router.post('/toggle', validate(toggleLikeSchema), likeController.toggleLike);
router.get('/', likeController.getLikers);

export default router;
