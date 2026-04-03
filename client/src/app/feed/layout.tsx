import type { Metadata } from 'next';

import { AuthGuard } from '@/components/shared/AuthGuard';

export const metadata: Metadata = {
  title: 'Social Feed',
  description: 'Connect with your friends and share your moments.',
};

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
