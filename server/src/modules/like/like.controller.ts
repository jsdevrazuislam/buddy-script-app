import { Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.middleware';
import { catchAsync } from '../../utils/catchAsync';

import * as likeService from './like.service';

export const toggleLike = catchAsync(async (req: AuthRequest, res: Response) => {
  const { targetId, targetType } = req.body;
  const result = await likeService.toggleLike(req.user?.id as string, targetId, targetType);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getLikers = catchAsync(async (req: AuthRequest, res: Response) => {
  const { targetId, targetType } = req.query;
  const result = await likeService.getLikers(targetId as string, targetType as string);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
