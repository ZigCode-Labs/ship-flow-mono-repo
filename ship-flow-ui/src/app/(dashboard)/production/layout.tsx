import type { Metadata } from 'next';
import { ProductionSidebar } from '@/components/shared/production-sidebar';

export const metadata: Metadata = {
  title: 'Production - Ship Flow',
  description: 'Production module management',
};

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <ProductionSidebar />

      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}
