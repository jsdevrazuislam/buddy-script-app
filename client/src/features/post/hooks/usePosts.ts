import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { FeedResponse, CreatePostPayload } from '@/types';

import { postApi } from '../services/postApi';

export const usePosts = () => {
  const queryClient = useQueryClient();

  // Infinite query for feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam }: { pageParam?: string }) => postApi.getFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedResponse) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
  });

  const posts = data?.pages.flatMap((page: FeedResponse) => page.posts) ?? [];

  const createPostMutation = useMutation({
    mutationFn: (postData: CreatePostPayload) => postApi.createPost(postData),
    onSuccess: () => {
      // Invalidate and refetch feed
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
    // Optional: Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });
      const previousPosts = queryClient.getQueryData(['posts', 'feed']);

      return { previousPosts };
    },
  });

  return {
    posts,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    createError: createPostMutation.error,
  };
};
