import apiClient from '@/services/axios';
import { ApiResponse, TargetType, User } from '@/types';

export const likeApi = {
  toggleLike: async (
    targetId: string,
    targetType: TargetType,
  ): Promise<{ isLiked: boolean; likesCount: number }> => {
    const response = await apiClient.post<ApiResponse<{ isLiked: boolean; likesCount: number }>>(
      '/likes/toggle',
      {
        targetId,
        targetType,
      },
    );
    return response.data.data;
  },

  getLikers: async (targetId: string, targetType: TargetType): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `/likes?targetId=${targetId}&targetType=${targetType}`,
    );
    return response.data.data;
  },
};
