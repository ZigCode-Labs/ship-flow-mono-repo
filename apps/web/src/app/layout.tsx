import '@/app/globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import * as React from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Ship Flow',
  description: 'Ship Flow UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body>
        <main className="w-full max-w-full">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
