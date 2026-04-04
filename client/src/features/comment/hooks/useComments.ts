import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import { PostComment } from '@/types';

import { commentApi } from '../services/commentApi';

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState(5);

  const {
    data: commentsResponse = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['comments', postId, limit],
    queryFn: () => commentApi.getPostComments(postId, limit, 0),
    enabled: !!postId,
  });

  // Since backend is DESC, we reverse for UI to show oldest at top, latest at bottom
  const comments = useMemo(() => {
    return [...commentsResponse].reverse();
  }, [commentsResponse]);

  const { user: currentUser } = useAuthStore();

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => commentApi.addComment(postId, text),
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData<PostComment[]>(['comments', postId, limit]);

      if (previousComments && currentUser) {
        const optimisticComment: PostComment & { isOptimistic?: boolean } = {
          id: `temp-${Date.now()}`,
          userId: currentUser.id,
          postId,
          text,
          parentId: null,
          likesCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: currentUser,
          isOptimistic: true,
        };

        queryClient.setQueryData<PostComment[]>(['comments', postId, limit], (old) => {
          return [optimisticComment, ...(old || [])];
        });
      }

      return { previousComments };
    },
    onSuccess: (newComment: PostComment) => {
      queryClient.setQueryData<PostComment[]>(['comments', postId, limit], (old) => {
        if (!old) return [newComment];
        return old.map((c: PostComment) =>
          (c.isOptimistic || c.id.startsWith('temp-')) && c.text === newComment.text
            ? newComment
            : c,
        );
      });
    },
    onError: (_err, _text, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId, limit], context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentApi.addReply(commentId, text),
    onMutate: async ({ commentId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData<PostComment[]>(['comments', postId, limit]);

      if (previousComments && currentUser) {
        const optimisticReply: PostComment & { isOptimistic?: boolean } = {
          id: `temp-${Date.now()}`,
          userId: currentUser.id,
          postId,
          text,
          parentId: commentId,
          likesCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: currentUser,
          isOptimistic: true,
        };

        queryClient.setQueryData<PostComment[]>(['comments', postId, limit], (old) => {
          return (old || []).map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), optimisticReply],
              };
            }
            return comment;
          });
        });
      }

      return { previousComments };
    },
    onSuccess: (newReply: PostComment) => {
      queryClient.setQueryData<PostComment[]>(['comments', postId, limit], (old) => {
        if (!old) return [];
        return old.map((comment) => {
          if (comment.id === newReply.parentId) {
            const replies = comment.replies || [];
            const optimisticIndex = replies.findIndex(
              (r) => (r.isOptimistic || r.id.startsWith('temp-')) && r.text === newReply.text,
            );

            if (optimisticIndex !== -1) {
              const updatedReplies = [...replies];
              updatedReplies[optimisticIndex] = newReply;
              return { ...comment, replies: updatedReplies };
            }
          }
          return comment;
        });
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId, limit], context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const loadMore = () => {
    setLimit((prev) => prev + 5);
  };

  return {
    comments,
    isLoading,
    error,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    addReply: addReplyMutation.mutate,
    isAddingReply: addReplyMutation.isPending,
    loadMore,
    hasMore: commentsResponse.length >= limit,
  };
};
