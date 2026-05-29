import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Ship Flow',
  description: 'Ship Flow Dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Main content — full width, no sidebar */}
      <main className="flex-1 w-full overflow-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-6">{children}</div>
      </main>

      <Toaster />
    </div>
  );
}
