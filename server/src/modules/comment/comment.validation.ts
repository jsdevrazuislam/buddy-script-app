import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    postId: z.string().uuid('Invalid post ID'),
    text: z.string().min(1, 'Comment text is required'),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Reply text is required'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid comment ID'),
  }),
});
