import Header from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ship Flow',
  description: 'Ship Flow - Trade Management System',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <Toaster />
    </>
  );
}
