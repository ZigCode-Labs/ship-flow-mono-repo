import type { Metadata } from 'next';
import { DomesticSidebar } from '@/components/shared/domestic-sidebar';

export const metadata: Metadata = {
  title: 'Domestic - Ship Flow',
  description: 'Domestic operations management',
};

export default function DomesticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DomesticSidebar />

      <main className="flex-1 min-w-0 h-full overflow-hidden">{children}</main>
    </div>
  );
}
