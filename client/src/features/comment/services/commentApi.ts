import apiClient from '@/services/axios';
import { ApiResponse, Comment } from '@/types';

export const commentApi = {
  getPostComments: async (postId: string, limit?: number, offset?: number): Promise<Comment[]> => {
    const response = await apiClient.get<ApiResponse<Comment[]>>(`/comments/post/${postId}`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  addComment: async (postId: string, text: string): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>('/comments', {
      postId,
      text,
    });
    return response.data.data;
  },

  addReply: async (commentId: string, text: string): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(`/comments/${commentId}/replies`, {
      text,
    });
    return response.data.data;
  },
};
