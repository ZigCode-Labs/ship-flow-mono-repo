'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Header from '@/components/header';
import { useAuthStore } from '@/store/auth';
import { useActiveOrgStore } from '@/store/organization';
import { api } from '@/lib/api';
import type { Org } from '@/store/organization';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const { activeOrg, setActiveOrg, isHydrated: orgHydrated } = useActiveOrgStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      router.push('/login');
      return;
    }
    if (!orgHydrated) return;

    // Always fetch current user's orgs from the API to avoid stale localStorage data
    api
      .get<(Org & { members: { role: string }[] })[]>('/organizations')
      .then((orgs) => {
        const match = orgs.find((o) => o.id === activeOrg?.id);
        if (match) {
          // Stale activeOrg is valid for this user — keep it
          if (!match.onboardingDone) {
            router.push('/onboarding');
          }
        } else if (orgs.length > 0) {
          setActiveOrg(orgs[0]);
        } else {
          setActiveOrg(null);
          router.push('/onboarding');
        }
      })
      .catch(() => {
        setActiveOrg(null);
        router.push('/onboarding');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isHydrated, orgHydrated, router, setActiveOrg]);

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
