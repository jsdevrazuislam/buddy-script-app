import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Providers from './providers';

// Importing custom CSS from src/assets/css
import '@/assets/css/bootstrap.min.css';
import '@/assets/css/common.css';
import '@/assets/css/main.css';
import '@/assets/css/responsive.css';

const poppins = Poppins({
  weight: ['100', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Buddy Script - Your Social Hub',
  description: 'Connect with friends and share your life.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
