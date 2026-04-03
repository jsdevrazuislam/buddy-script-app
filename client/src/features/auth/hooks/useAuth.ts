import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/useAuthStore';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/types';

import { authApi } from '../services/authApi';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload.email, payload.password),
    onSuccess: (data: AuthResponse) => {
      Cookies.set('access_token', data.accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refresh_token', data.refreshToken, { secure: true, sameSite: 'strict' });
      setAuth(data.user, data.accessToken);
      router.push('/feed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data: AuthResponse) => {
      Cookies.set('access_token', data.accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refresh_token', data.refreshToken, { secure: true, sameSite: 'strict' });
      setAuth(data.user, data.accessToken);
      router.push('/feed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refreshToken = Cookies.get('refresh_token');
      return authApi.logout(refreshToken || '');
    },
    onSettled: () => {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
