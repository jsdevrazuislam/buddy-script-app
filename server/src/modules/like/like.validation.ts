import { z } from 'zod';

export const toggleLikeSchema = z.object({
  body: z.object({
    targetId: z.string().uuid('Invalid target ID'),
    targetType: z.enum(['POST', 'COMMENT', 'REPLY']),
  }),
});
