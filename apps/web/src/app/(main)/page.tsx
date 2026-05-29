'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && token) {
      router.push('/dashboard');
    }
  }, [token, isHydrated, router]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-10">
      <h1 className="mb-4 text-3xl font-semibold">Welcome to Ship Flow</h1>
      {token ? (
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      ) : (
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
