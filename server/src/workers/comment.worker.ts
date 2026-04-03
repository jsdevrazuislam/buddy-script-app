import { Worker, Job } from 'bullmq';

import redis from '../config/redis';
import commentRepository from '../repositories/comment.repository';
import postRepository from '../repositories/post.repository';
import { logger } from '../utils/logger';

const COMMENT_BUFFER_KEY = 'buffer:comments';
const BATCH_SIZE = 500;

export const commentWorker = new Worker(
  'comment-queue',
  async (job: Job) => {
    if (job.name === 'process-comments') {
      logger.info('Processing comment batch...');

      const items = await redis.lrange(COMMENT_BUFFER_KEY, 0, BATCH_SIZE - 1);

      if (items.length === 0) return;

      await redis.ltrim(COMMENT_BUFFER_KEY, items.length, -1);

      const comments = items.map((item) => JSON.parse(item));

      // 1. Bulk DB Insert
      try {
        const commentsToCreate = comments.map((c) => ({
          id: c.id,
          userId: c.userId,
          postId: c.postId,
          text: c.text,
          parentId: c.parentId,
        }));

        await commentRepository.bulkCreate(commentsToCreate);

        // 2. Clear pending cache for these posts (since they are now in DB)
        const postIds = new Set(comments.map((c) => c.postId));
        for (const postId of postIds) {
          await redis.del(`pending:comments:${postId}`);
        }

        // 3. Update Post Comment Counts
        const postCountUpdates: Record<string, number> = {};
        for (const c of comments) {
          postCountUpdates[c.postId] = (postCountUpdates[c.postId] || 0) + 1;
        }

        for (const [postId, delta] of Object.entries(postCountUpdates)) {
          await postRepository.incrementComments(postId, delta);
        }

        logger.info(`Successfully processed ${comments.length} comments.`);
      } catch (error) {
        logger.error('Failed to process comment batch:', error);
        throw error;
      }
    }
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

commentWorker.on('completed', (job) => {
  logger.info(`Comment job ${job.id} completed`);
});

commentWorker.on('failed', (job, err) => {
  logger.error(`Comment job ${job?.id} failed: ${err.message}`);
});
