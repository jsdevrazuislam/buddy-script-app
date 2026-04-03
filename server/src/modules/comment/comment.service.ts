import { v4 as uuidv4 } from 'uuid';

import redis from '../../config/redis';
import { User } from '../../models';
import commentRepository from '../../repositories/comment.repository';
import { socketService, batchEmitter } from '../../services/socket.service';
import { NotFoundError } from '../../utils/errors';

export const createComment = async (userId: string, postId: string, text: string) => {
  const commentId = uuidv4();

  // 1. Prepare job data for worker
  const jobData = {
    id: commentId,
    userId,
    postId,
    text,
    parentId: null,
    action: 'create',
    timestamp: Date.now(),
  };

  // 2. Fetch user for optimistic return and cache
  const user = await User.findByPk(userId, { attributes: ['id', 'firstName', 'lastName'] });

  const optimisticComment = {
    id: commentId,
    userId,
    postId,
    text,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user,
    likesCount: 0,
    isLiked: false,
    replies: [],
  };

  // 3. Batch Buffer + Pending Cache for immediate visibility
  const pendingKey = `pending:comments:${postId}`;
  await Promise.all([
    redis.rpush('buffer:comments', JSON.stringify(jobData)),
    redis.rpush(pendingKey, JSON.stringify(optimisticComment)),
    redis.expire(pendingKey, 60), // Short TTL safety
    redis.incr(`count:comments:POST:${postId}`),
  ]);

  // 4. Real-time updates via Socket.IO
  socketService.emitToPost(postId, 'comment:created', optimisticComment);
  batchEmitter.queueUpdate(postId, 'comments', 1);

  return optimisticComment;
};

export const createReply = async (userId: string, parentId: string, text: string) => {
  const parentComment = await commentRepository.findById(parentId);

  if (!parentComment) {
    throw new NotFoundError('Parent comment not found');
  }

  const commentId = uuidv4();
  const actualParentId = parentComment.parentId || parentId;

  // 1. Prepare job data for worker
  const jobData = {
    id: commentId,
    userId,
    postId: parentComment.postId,
    text,
    parentId: actualParentId,
    action: 'create',
    timestamp: Date.now(),
  };

  // 2. Fetch user for optimistic return and cache
  const user = await User.findByPk(userId, { attributes: ['id', 'firstName', 'lastName'] });

  const optimisticReply = {
    id: commentId,
    userId,
    postId: parentComment.postId,
    text,
    parentId: actualParentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    user,
    likesCount: 0,
    isLiked: false,
    replies: [],
  };

  // 3. Batch Buffer + Pending Cache
  const pendingKey = `pending:comments:${parentComment.postId}`;
  await Promise.all([
    redis.rpush('buffer:comments', JSON.stringify(jobData)),
    redis.rpush(pendingKey, JSON.stringify(optimisticReply)),
    redis.expire(pendingKey, 60),
    redis.incr(`count:comments:POST:${parentComment.postId}`),
  ]);

  // 4. Real-time updates via Socket.IO
  socketService.emitToPost(parentComment.postId, 'reply:created', optimisticReply);
  batchEmitter.queueUpdate(parentComment.postId, 'comments', 1);

  return optimisticReply;
};

export const getCommentsForPost = async (
  userId: string,
  postId: string,
  limit?: number,
  offset?: number,
) => {
  // 1. Fetch persisted comments from DB
  const dbComments = await commentRepository.findByPostId(userId, postId, limit, offset);

  // 2. Fetch pending comments from Redis
  const pendingKey = `pending:comments:${postId}`;
  const pendingRaw = await redis.lrange(pendingKey, 0, -1);
  const pendingComments = pendingRaw.map((raw) => JSON.parse(raw));
  if (pendingComments.length === 0) {
    return dbComments;
  }

  // 3. Merge and Deduplicate (DB version wins)
  const dbCommentIds = new Set(dbComments.map((c) => c.id));
  const filteredPending = pendingComments.filter((pc: { id: string }) => !dbCommentIds.has(pc.id));

  // Merge top-level comments and replies appropriately
  // For simplicity, we treat pending comments normally. If a pending comment is a reply,
  // it might need to be nested if it's not already.
  const merged = [...filteredPending.filter((c) => !c.parentId), ...dbComments];

  // Handle pending replies (attach to their parents)
  const pendingReplies = filteredPending.filter((c) => c.parentId);
  for (const reply of pendingReplies) {
    const parent = merged.find((c) => c.id === reply.parentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      // Deduplicate reply as well
      if (!parent.replies.some((r: { id: string }) => r.id === reply.id)) {
        parent.replies.unshift(reply);
      }
    }
  }

  // Sort top-level by createdAt DESC
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
