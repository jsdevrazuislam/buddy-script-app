import { Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.middleware';
import { catchAsync } from '../../utils/catchAsync';

import * as commentService from './comment.service';

export const createComment = catchAsync(async (req: AuthRequest, res: Response) => {
  const { postId, text } = req.body;
  const result = await commentService.createComment(req.user!.id, postId as string, text as string);
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const createReply = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  const { text } = req.body;
  const result = await commentService.createReply(req.user!.id, id, text as string);
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const getPostComments = catchAsync(async (req: AuthRequest, res: Response) => {
  const postId = req.params['postId'] as string;
  const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined;
  const offset = req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined;

  const result = await commentService.getCommentsForPost(req.user!.id, postId, limit, offset);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
