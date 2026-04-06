import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LazyFirebaseProvider } from '@/components/shared/lazy-firebase-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NEU Access Hub | Visitor Management',
  description: 'Institutional access control and library visitor logging for New Era University.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allows 500% zoom
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <LazyFirebaseProvider>
          {children}
        </LazyFirebaseProvider>
      </body>
    </html>
  );
}
