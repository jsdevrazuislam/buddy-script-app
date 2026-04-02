export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

export type Visibility = 'PUBLIC' | 'PRIVATE';
export type TargetType = 'POST' | 'COMMENT' | 'REPLY';

export interface Post {
  id: string;
  userId: string;
  text: string;
  imageUrl?: string | null;
  visibility: Visibility;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  text: string;
  parentId: string | null;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  targetId: string;
  targetType: TargetType;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface FeedResponse {
  posts: Post[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreatePostPayload {
  text: string;
  imageUrl?: string;
  visibility: Visibility;
}

export interface CreateCommentPayload {
  postId: string;
  text: string;
  parentId?: string | null;
}
