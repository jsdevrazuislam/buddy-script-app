import apiClient from '@/services/axios';
import { ApiResponse, PostComment } from '@/types';

export const commentApi = {
  getPostComments: async (
    postId: string,
    limit?: number,
    offset?: number,
  ): Promise<PostComment[]> => {
    const response = await apiClient.get<ApiResponse<PostComment[]>>(`/comments/post/${postId}`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  addComment: async (postId: string, text: string): Promise<PostComment> => {
    const response = await apiClient.post<ApiResponse<PostComment>>('/comments', {
      postId,
      text,
    });
    return response.data.data;
  },

  addReply: async (commentId: string, text: string): Promise<PostComment> => {
    const response = await apiClient.post<ApiResponse<PostComment>>(
      `/comments/${commentId}/replies`,
      {
        text,
      },
    );
    return response.data.data;
  },
};
