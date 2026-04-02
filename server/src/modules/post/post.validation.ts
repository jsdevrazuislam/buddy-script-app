import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Post text is required'),
    imageUrl: z.string().url('Invalid image URL').optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  }),
});

export const getFeedSchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
  }),
});
