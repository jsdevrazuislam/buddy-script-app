import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

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

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => commentApi.addComment(postId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentApi.addReply(commentId, text),
    onSuccess: () => {
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
