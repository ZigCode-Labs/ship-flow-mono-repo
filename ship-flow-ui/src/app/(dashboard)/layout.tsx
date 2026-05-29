'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Header from '@/components/header';
import { useAuthStore } from '@/store/auth';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !token) {
      router.push('/login');
    }
  }, [token, isHydrated, router]);

  if (!isHydrated || !token) {
    return <div>Loading...</div>;
  }

  const isDashboardPage = pathname === '/dashboard';

  return (
    <>
      {isDashboardPage ? (
        <>
          <div className="h-16 flex-shrink-0">
            <Header />
          </div>
          {children}
        </>
      ) : (
        <DashboardLayout>{children}</DashboardLayout>
      )}
    </>
  );
}
