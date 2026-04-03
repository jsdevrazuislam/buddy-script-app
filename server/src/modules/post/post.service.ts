import { z } from 'zod';

import { generateSignedUploadUrl } from '../../config/cloudinary';
import redis from '../../config/redis';
import postRepository from '../../repositories/post.repository';

import { createPostSchema } from './post.validation';

type CreatePostInput = z.infer<typeof createPostSchema>['body'];

export const createPost = async (userId: string, data: CreatePostInput) => {
  const post = await postRepository.create({
    ...data,
    userId,
  });

  post.setDataValue('likesCount', 0);
  post.setDataValue('commentsCount', 0);
  post.setDataValue('isLiked', false);

  return post;
};

export const getSignedUrl = async () => {
  return await generateSignedUploadUrl('social_feed_posts');
};

export const getFeed = async (userId: string, cursor?: string, limit: number = 10) => {
  const posts = await postRepository.findFeed(userId, cursor, limit);

  const hasNextPage = posts.length > limit;
  const edges = hasNextPage ? posts.slice(0, -1) : posts;

  // Enhance with Redis data using Pipelining
  const pipeline = redis.pipeline();
  edges.forEach((post) => {
    pipeline.sismember(`likes:POST:${post.id}`, userId);
    pipeline.get(`count:likes:POST:${post.id}`);
    pipeline.get(`count:comments:POST:${post.id}`);
  });

  const redisResults = await pipeline.exec();

  if (redisResults) {
    edges.forEach((post, index) => {
      const isLiked = redisResults[index * 3][1] === 1;
      const cachedLikesCount = redisResults[index * 3 + 1][1];
      const cachedCommentsCount = redisResults[index * 3 + 2][1];

      post.setDataValue('isLiked', isLiked);
      if (cachedLikesCount !== null) {
        post.setDataValue('likesCount', parseInt(cachedLikesCount as string));
      }
      if (cachedCommentsCount !== null) {
        post.setDataValue('commentsCount', parseInt(cachedCommentsCount as string));
      }
    });
  }

  const endCursor = edges.length > 0 ? edges[edges.length - 1].createdAt.toISOString() : null;

  return {
    posts: edges,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
  };
};

export const getPostById = async (postId: string, userId?: string) => {
  const post = await postRepository.findById(postId, userId);
  if (!post) return null;

  if (userId) {
    const [isLiked, cachedLikesCount, cachedCommentsCount] = await Promise.all([
      redis.sismember(`likes:POST:${postId}`, userId),
      redis.get(`count:likes:POST:${postId}`),
      redis.get(`count:comments:POST:${postId}`),
    ]);

    post.setDataValue('isLiked', isLiked === 1);
    if (cachedLikesCount !== null) {
      post.setDataValue('likesCount', parseInt(cachedLikesCount));
    }
    if (cachedCommentsCount !== null) {
      post.setDataValue('commentsCount', parseInt(cachedCommentsCount));
    }
  }

  return post;
};
