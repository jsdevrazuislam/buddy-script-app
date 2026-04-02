import apiClient from '@/services/axios';
import { ApiResponse, FeedResponse, Post, Visibility } from '@/types';

export const postApi = {
  getFeed: async (cursor?: string, limit: number = 10): Promise<FeedResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<ApiResponse<FeedResponse>>(`/posts?${params.toString()}`);
    return response.data.data;
  },

  createPost: async (postData: { text: string; imageUrl?: string; visibility: Visibility }): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', postData);
    return response.data.data;
  },

  getUploadUrl: async (): Promise<{ timestamp: number; signature: string; cloudName: string; apiKey: string; folder: string }> => {
    const response = await apiClient.get<ApiResponse<{ timestamp: number; signature: string; cloudName: string; apiKey: string; folder: string }>>('/posts/upload-url');
    return response.data.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${postId}`);
    return response.data.data;
  },
};
