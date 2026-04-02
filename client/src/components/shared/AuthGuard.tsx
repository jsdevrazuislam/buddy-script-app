'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, clearAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    // If no tokens, clear local auth state and redirect if on protected route
    if (!accessToken && !refreshToken) {
      if (isAuthenticated) {
        clearAuth();
      }
      if (pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
        return;
      }
      // Delaying setState slightly to prevent the warning about cascading renders
      setTimeout(() => setIsChecking(false), 0);
      return;
    }

    // If authenticated and on auth pages, redirect to feed
    if ((accessToken || refreshToken) && (pathname === '/login' || pathname === '/register')) {
      router.replace('/feed');
      return;
    }

    setTimeout(() => setIsChecking(false), 0);
  }, [isAuthenticated, pathname, router, clearAuth]);

  if (isChecking) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
