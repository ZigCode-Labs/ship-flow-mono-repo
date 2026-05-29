import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';

export default function HomePage() {
  const token = typeof window !== 'undefined' ? useAuthStore.getState().token : null;

  return (
    <div className="py-10">
      <h1 className="mb-4 text-3xl font-semibold">Welcome to Ship Flow</h1>
      {token ? (
        <p className="text-muted-foreground">You are logged in.</p>
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
