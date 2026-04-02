import { redirect } from 'next/navigation';

export default function Home() {
  // Simple redirection to feed (will be caught by middleware if not authenticated)
  redirect('/feed');
}
