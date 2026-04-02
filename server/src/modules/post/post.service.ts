import postRepository from '../../repositories/post.repository';
import { generateSignedUploadUrl } from '../../config/cloudinary';
import redisClient from '../../config/redis';
import { z } from 'zod';
import { createPostSchema } from './post.validation';

type CreatePostInput = z.infer<typeof createPostSchema>['body'];

export const createPost = async (userId: string, data: CreatePostInput) => {
  const post = await postRepository.create({
    ...data,
    userId,
  });

  // Attach default values for the newly created post
  post.setDataValue('likesCount', 0);
  post.setDataValue('commentsCount', 0);
  post.setDataValue('isLiked', false);

  return post;
};

export const getSignedUrl = async () => {
  return await generateSignedUploadUrl('social_feed_posts');
};

export const getFeed = async (userId: string, cursor?: string, limit: number = 10) => {
  // Try to get from cache first for first page
  if (!cursor && limit === 10) {
    const cachedFeed = await redisClient.get(`feed:${userId}`);
    if (cachedFeed) {
      return JSON.parse(cachedFeed);
    }
  }

  const posts = await postRepository.findFeed(userId, cursor, limit);

  const hasNextPage = posts.length > limit;
  const edges = hasNextPage ? posts.slice(0, -1) : posts;

  const endCursor = edges.length > 0 ? edges[edges.length - 1].createdAt.toISOString() : null;

  const result = {
    posts: edges,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
  };

  // Cache first page for 60 seconds
  if (!cursor && limit === 10) {
    await redisClient.set(`feed:${userId}`, JSON.stringify(result), {
      EX: 60,
    });
  }

  return result;
};

export const getPostById = async (postId: string, userId?: string) => {
  return await postRepository.findById(postId, userId);
};
