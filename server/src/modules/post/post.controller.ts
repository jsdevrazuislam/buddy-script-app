import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as postService from './post.service';

export const createPost = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await postService.createPost(req.user!.id, req.body);
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const getUploadUrl = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await postService.getSignedUrl();
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getFeed = catchAsync(async (req: AuthRequest, res: Response) => {
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const result = await postService.getFeed(req.user!.id, cursor, limit);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getPost = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await postService.getPostById(req.params['id'] as string, req.user?.id);
  if (!result) {
    return res.status(404).json({
      status: 'error',
      message: 'Post not found',
    });
  }
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
