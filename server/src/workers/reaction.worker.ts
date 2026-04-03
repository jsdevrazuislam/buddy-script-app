import { Worker, Job } from 'bullmq';
import redis from '../config/redis';
import likeRepository from '../repositories/like.repository';
import postRepository from '../repositories/post.repository';
import { logger } from '../utils/logger';

const REACTION_BUFFER_KEY = 'buffer:reactions';
const BATCH_SIZE = 1000;

export const reactionWorker = new Worker(
  'reaction-queue',
  async (job: Job) => {
    if (job.name === 'process-reactions') {
      logger.info('Processing reaction batch...');
      
      const items = await redis.lrange(REACTION_BUFFER_KEY, 0, BATCH_SIZE - 1);
      
      if (items.length === 0) return;

      // Remove items from buffer
      await redis.ltrim(REACTION_BUFFER_KEY, items.length, -1);

      const reactions = items.map((item) => JSON.parse(item));
      
      // 2. Aggregate operations
      const likesToCreate: any[] = [];
      const likesToDelete: any[] = [];
      const postCountUpdates: Record<string, number> = {};

      for (const req of reactions) {
        if (req.action === 'like') {
          likesToCreate.push({
            userId: req.userId,
            targetId: req.targetId,
            targetType: req.targetType,
          });
          if (req.targetType === 'POST') {
            postCountUpdates[req.targetId] = (postCountUpdates[req.targetId] || 0) + 1;
          }
        } else {
          likesToDelete.push({
            userId: req.userId,
            targetId: req.targetId,
            targetType: req.targetType,
          });
          if (req.targetType === 'POST') {
            postCountUpdates[req.targetId] = (postCountUpdates[req.targetId] || 0) - 1;
          }
        }
      }

      // 3. Bulk DB Operations
      try {
        if (likesToCreate.length > 0) {
          await likeRepository.bulkCreate(likesToCreate);
        }
        if (likesToDelete.length > 0) {
          await likeRepository.bulkDestroy(likesToDelete);
        }

        // 4. Update Post Counts in Bulk
        for (const [postId, delta] of Object.entries(postCountUpdates)) {
          await postRepository.incrementLikes(postId, delta);
        }

        logger.info(`Successfully processed ${reactions.length} reactions.`);
      } catch (error) {
        logger.error('Failed to process reaction batch:', error);
        // Potential data loss here if not handled. In prod, we'd push back to a DLQ or retry.
        throw error;
      }
    }
  },
  {
    connection: redis,
    concurrency: 1, // Keep it simple for batching
  },
);

reactionWorker.on('completed', (job) => {
  logger.info(`Reaction job ${job.id} completed`);
});

reactionWorker.on('failed', (job, err) => {
  logger.error(`Reaction job ${job?.id} failed: ${err.message}`);
});
