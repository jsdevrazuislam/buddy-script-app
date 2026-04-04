'use client';

import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { useAuthStore } from '@/store/useAuthStore';
import { User, PostComment } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
      : 'http://localhost:9000';

    if (!token) {
      setTimeout(() => {
        setSocket(null);
        setIsConnected(false);
      }, 0);
      return;
    }

    const socketInstance = io(apiBaseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    // Global Listeners
    interface StatsPayload {
      postId: string;
      likes: number;
      comments: number;
      totalLikes: number | null;
      totalComments: number | null;
    }

    socketInstance.on('post:stats_updated', (data: StatsPayload) => {
      // Update feed cache
      queryClient.setQueriesData({ queryKey: ['posts', 'feed'] }, (oldData: unknown) => {
        if (!oldData) return oldData;
        const oData = oldData as { pages: unknown[] };
        return {
          ...oData,
          pages: oData.pages.map((page: unknown) => {
            const p = page as { posts: unknown[] };
            return {
              ...p,
              posts: p.posts.map((post: unknown) => {
                const po = post as { id: string; likesCount: number; commentsCount: number };
                if (po.id === data.postId) {
                  // Prefer absolute total counts to prevent double counting with optimistic UI
                  return {
                    ...po,
                    likesCount:
                      data.totalLikes !== null
                        ? data.totalLikes
                        : (po.likesCount || 0) + (data.likes || 0),
                    commentsCount:
                      data.totalComments !== null
                        ? data.totalComments
                        : (po.commentsCount || 0) + (data.comments || 0),
                  };
                }
                return po;
              }),
            };
          }),
        };
      });

      // Update individual post cache if it exists (for post detail view if implemented)
      queryClient.setQueriesData({ queryKey: ['post', data.postId] }, (oldData: unknown) => {
        if (!oldData) return oldData;
        const oData = oldData as { likesCount?: number; commentsCount?: number };
        return {
          ...oData,
          likesCount:
            data.totalLikes !== null
              ? data.totalLikes
              : (oData.likesCount || 0) + (data.likes || 0),
          commentsCount:
            data.totalComments !== null
              ? data.totalComments
              : (oData.commentsCount || 0) + (data.comments || 0),
        };
      });
    });

    interface ActionPayload {
      userId: string;
      targetId: string;
      targetType: 'POST' | 'COMMENT' | 'REPLY';
      postId?: string;
      totalLikes?: number | null;
    }

    const handleLikeEvent = (data: ActionPayload) => {
      queryClient.invalidateQueries({ queryKey: ['likers', data.targetId, data.targetType] });

      if (data.targetType === 'COMMENT' || data.targetType === 'REPLY') {
        const { postId, targetId, totalLikes } = data;
        if (postId && totalLikes !== undefined && totalLikes !== null) {
          queryClient.setQueriesData({ queryKey: ['comments', postId] }, (oldData: unknown) => {
            if (!oldData) return oldData;
            const existing = Array.isArray(oldData) ? oldData : [];
            return existing.map((comment: unknown) => {
              const c = comment as {
                id: string;
                likesCount: number;
                user: User;
                replies?: PostComment[];
                isOptimistic?: boolean;
              };
              if (c.id === targetId) {
                return { ...c, likesCount: totalLikes };
              }
              if (c.replies) {
                return {
                  ...c,
                  replies: c.replies.map((reply: unknown) => {
                    const r = reply as { id: string; likesCount: number };
                    return r.id === targetId ? { ...r, likesCount: totalLikes } : r;
                  }),
                };
              }
              return c;
            });
          });
        }
      }
    };

    socketInstance.on('post:liked', handleLikeEvent);
    socketInstance.on('post:unliked', handleLikeEvent);
    socketInstance.on('comment:liked', handleLikeEvent);
    socketInstance.on('comment:unliked', handleLikeEvent);
    socketInstance.on('reply:liked', handleLikeEvent);
    socketInstance.on('reply:unliked', handleLikeEvent);

    // The payload emitted from the server matches the PostComment type
    socketInstance.on('comment:created', (newComment: PostComment) => {
      // Update comments list for the post
      queryClient.setQueriesData(
        { queryKey: ['comments', newComment.postId] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          // Ensure we are adding to the existing array
          const existing = Array.isArray(oldData) ? oldData : [];

          // 1. Deduplicate by ID (prevents re-adding if already added)
          if (existing.some((c: PostComment) => c.id === newComment.id)) return oldData;

          // 2. Check for matching optimistic comment (same text and user)
          // This is safe within the scope of a single post query
          const optimisticIndex = existing.findIndex(
            (c: PostComment) =>
              (c.isOptimistic || c.id.startsWith('temp-')) &&
              c.text === newComment.text &&
              c.userId === newComment.userId,
          );

          if (optimisticIndex !== -1) {
            // Replace the optimistic comment with the real one
            const updated = [...existing];
            updated[optimisticIndex] = newComment;
            return updated;
          }

          // 3. Otherwise add as new to the front (DESC order)
          return [newComment, ...existing];
        },
      );
    });

    socketInstance.on('reply:created', (newReply: PostComment) => {
      queryClient.setQueriesData(
        { queryKey: ['comments', newReply.postId] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          const existing = Array.isArray(oldData) ? oldData : [];
          return existing.map((comment: PostComment) => {
            if (comment.id === newReply.parentId) {
              const replies = comment.replies || [];

              // 1. Deduplicate by ID
              if (replies.some((r: PostComment) => r.id === newReply.id)) return comment;

              // 2. Check for matching optimistic reply
              const optimisticIndex = replies.findIndex(
                (r: PostComment) =>
                  (r.isOptimistic || r.id.startsWith('temp-')) &&
                  r.text === newReply.text &&
                  r.userId === newReply.userId,
              );

              if (optimisticIndex !== -1) {
                const updatedReplies = [...replies];
                updatedReplies[optimisticIndex] = newReply;
                return { ...comment, replies: updatedReplies };
              }

              // 3. Add as new
              return {
                ...comment,
                replies: [newReply, ...replies],
              };
            }
            return comment;
          });
        },
      );
    });

    setTimeout(() => {
      setSocket(socketInstance);
    }, 0);

    return () => {
      socketInstance.disconnect();
    };
  }, [queryClient, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
