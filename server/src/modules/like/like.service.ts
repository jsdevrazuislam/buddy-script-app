import likeRepository from '../../repositories/like.repository';
import redis from '../../config/redis';

const CACHE_TTL = 3600; // 1 hour

export const toggleLike = async (
  userId: string,
  targetId: string,
  targetType: 'POST' | 'COMMENT' | 'REPLY',
) => {
  const key = `likes:${targetType}:${targetId}`;
  
  // 1. Check if user already liked
  let isLiked = await redis.sismember(key, userId);
  
  // 2. Populate cache if miss
  const exists = await redis.exists(key);
  if (!exists) {
    const existingLikers = await likeRepository.findUsersByTarget(targetId, targetType);
    const userIds = existingLikers.map(u => u.id);
    if (userIds.length > 0) {
      await redis.sadd(key, ...userIds);
    } else {
      await redis.sadd(key, 'INIT_MARKER'); 
    }
    await redis.expire(key, CACHE_TTL);
    isLiked = await redis.sismember(key, userId);
  }

  const action = isLiked ? 'unlike' : 'like';

  // 3. Optimistic Update in Redis
  if (isLiked) {
    await redis.srem(key, userId);
    await redis.decr(`count:likes:${targetType}:${targetId}`);
  } else {
    await redis.sadd(key, userId);
    await redis.incr(`count:likes:${targetType}:${targetId}`);
  }

  // 4. Buffer for Batch Processing
  await redis.rpush('buffer:reactions', JSON.stringify({
    userId,
    targetId,
    targetType,
    action,
    timestamp: Date.now(),
  }));

  // Ensure the worker knows there is work (optional if using repeatable job)
  // await reactionQueue.add('process-reactions', {}, { jobId: 'reaction-batcher', repeat: { every: 5000 } });

  return { liked: !isLiked };
};

export const getLikers = async (targetId: string, targetType: string) => {
  const key = `likes:${targetType}:${targetId}`;
  const userIds = await redis.smembers(key);
  
  if (userIds.length > 0) {
    const filteredIds = userIds.filter(id => id !== 'INIT_MARKER');
    return await likeRepository.findUsersByIds(filteredIds);
  }

  const likers = await likeRepository.findUsersByTarget(targetId, targetType);
  if (likers.length > 0) {
    await redis.sadd(key, ...likers.map(u => u.id));
    await redis.expire(key, CACHE_TTL);
  }
  return likers;
};

export const getLikesCount = async (targetId: string, targetType: string) => {
  const countKey = `count:likes:${targetType}:${targetId}`;
  const cachedCount = await redis.get(countKey);
  
  if (cachedCount !== null) {
    return parseInt(cachedCount);
  }

  const count = await likeRepository.count(targetId, targetType);
  await redis.set(countKey, count, 'EX', CACHE_TTL);
  return count;
};
