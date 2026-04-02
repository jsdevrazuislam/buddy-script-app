import { AuthGuard } from '@/components/shared/AuthGuard';
import type { Metadata } from 'next';

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
