import redis from '../config/redis';
import { getIO } from '../config/socket';
import { logger } from '../utils/logger';

class SocketService {
  /**
   * Broadcast an event to a specific post room
   *
   * @param postId
   * @param eventName
   * @param data
   */
  emitToPost(postId: string, eventName: string, data: unknown) {
    try {
      const io = getIO();
      io.to(`post:${postId}`).emit(eventName, data);
      logger.debug(`Emitted event ${eventName} to post:${postId}`);
    } catch (err) {
      logger.error('Socket Emission Error:', err);
    }
  }

  /**
   * Universal emit helper
   *
   * @param eventName
   * @param data
   */
  broadcast(eventName: string, data: unknown) {
    const io = getIO();
    io.emit(eventName, data);
  }
}

// Singleton aggregation for hot posts
class BatchEmitterService {
  private static instance: BatchEmitterService;
  private batch: Map<string, { likes: number; comments: number }> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private readonly WINDOW_MS = 500;

  private constructor() {}

  static getInstance() {
    if (!BatchEmitterService.instance) {
      BatchEmitterService.instance = new BatchEmitterService();
    }
    return BatchEmitterService.instance;
  }

  /**
   * Add a like/comment event to the batch
   *
   * @param postId
   * @param type
   * @param increment
   */
  queueUpdate(postId: string, type: 'likes' | 'comments', increment: number = 1) {
    const current = this.batch.get(postId) || { likes: 0, comments: 0 };
    current[type] += increment;
    this.batch.set(postId, current);

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.WINDOW_MS);
    }
  }

  /**
   * Flush the batch and emit to clients
   */
  private async flush() {
    const socketService = new SocketService();
    const batchData = Array.from(this.batch.entries());
    this.batch.clear();
    this.timer = null;

    for (const [postId, update] of batchData) {
      try {
        // Fetch absolute counts from Redis for robust sync
        const [totalLikes, totalComments] = await Promise.all([
          redis.get(`count:likes:POST:${postId}`),
          redis.get(`count:comments:POST:${postId}`),
        ]);

        socketService.emitToPost(postId, 'post:stats_updated', {
          postId,
          likes: update.likes,
          comments: update.comments,
          totalLikes: totalLikes ? parseInt(totalLikes) : null,
          totalComments: totalComments ? parseInt(totalComments) : null,
        });
      } catch (err) {
        logger.error(`Error in batch flush for post ${postId}:`, err);
      }
    }
  }
}

export const socketService = new SocketService();
export const batchEmitter = BatchEmitterService.getInstance();
