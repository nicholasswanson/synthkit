import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Synthkit Next.js Example',
  description: 'Demo app showcasing Synthkit integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed top-4 left-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm z-50">
          ✅ App Working
        </div>
        {children}
      </body>
    </html>
  );
}
