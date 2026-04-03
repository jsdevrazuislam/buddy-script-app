import { Queue, QueueOptions } from 'bullmq';
import redis from './redis';

const defaultOptions: QueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const reactionQueue = new Queue('reaction-queue', defaultOptions);
export const commentQueue = new Queue('comment-queue', defaultOptions);

export default {
  reactionQueue,
  commentQueue,
};
