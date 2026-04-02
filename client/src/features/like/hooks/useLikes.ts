import { useMutation, useQueryClient, InfiniteData, useQuery } from '@tanstack/react-query';
import { likeApi } from '../services/likeApi';
import { TargetType, Post, Comment, FeedResponse } from '@/types';

export const useToggleLike = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, targetType }: { targetId: string; targetType: TargetType }) =>
      likeApi.toggleLike(targetId, targetType),
    
    onMutate: async ({ targetId, targetType }) => {
      // Snapshot state
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });
      if (postId) {
        await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      }

      const previousFeed = queryClient.getQueryData<InfiniteData<FeedResponse>>(['posts', 'feed']);
      const previousComments = postId ? queryClient.getQueryData<Comment[]>(['comments', postId]) : undefined;

      // Optimistic update
      if (targetType === 'POST') {
        queryClient.setQueryData<InfiniteData<FeedResponse>>(['posts', 'feed'], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) => {
                if (post.id === targetId) {
                  return {
                    ...post,
                    isLiked: !post.isLiked,
                    likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                  };
                }
                return post;
              }),
            })),
          };
        });
      } else if (postId && (targetType === 'COMMENT' || targetType === 'REPLY')) {
        queryClient.setQueryData(['comments', postId], (old: Comment[] | undefined) => {
          if (!old) return old;
          return old.map((comment) => {
            if (comment.id === targetId) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
              };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply.id === targetId) {
                    return {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likesCount: reply.isLiked ? reply.likesCount - 1 : reply.likesCount + 1,
                    };
                  }
                  return reply;
                }),
              };
            }
            return comment;
          });
        });
      }

      return { previousFeed, previousComments };
    },

    onSuccess: (data, { targetId, targetType }) => {
      // Sync with server data exactly to prevent resetting to old state
      if (targetType === 'POST') {
        queryClient.setQueryData<InfiniteData<FeedResponse>>(['posts', 'feed'], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) => {
                if (post.id === targetId) {
                  return { ...post, ...data };
                }
                return post;
              }),
            })),
          };
        });
      } else if (postId) {
        queryClient.setQueryData(['comments', postId], (old: Comment[] | undefined) => {
          if (!old) return old;
          return old.map((comment) => {
            if (comment.id === targetId) return { ...comment, ...data };
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) => 
                  reply.id === targetId ? { ...reply, ...data } : reply
                ),
              };
            }
            return comment;
          });
        });
      }
    },

    onError: (err, variables, context: { previousFeed?: InfiniteData<FeedResponse>; previousComments?: Comment[] } | undefined) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      if (postId && context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
    },
    

  });
};

export const useLikers = (targetId: string, targetType: TargetType) => {
  return useQuery({
    queryKey: ['likers', targetId, targetType],
    queryFn: () => likeApi.getLikers(targetId, targetType),
    enabled: !!targetId,
  });
};
