'use client';

import { useEffect } from 'react';

import { useSocketContext } from '../SocketProvider';

export const useSocket = (postId?: string) => {
  const { socket, isConnected } = useSocketContext();

  // Helper to join/leave rooms
  useEffect(() => {
    if (!socket || !isConnected || !postId) return;

    socket.emit('join_post', postId);

    return () => {
      socket.emit('leave_post', postId);
    };
  }, [socket, isConnected, postId]);

  return { socket, isConnected };
};
