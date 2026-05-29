'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const res = await api.post<{ data: { token: string; user?: { id: string; email: string } } }>(
        '/auth/login',
        values,
      );

      if (!res?.data?.token) {
        throw new Error('Invalid response from server');
      }
      setToken(res?.data?.token);
      if (res?.data?.user) setUser(res?.data?.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setSubmitError(message);
    }
  };

  const handleGuestLogin = () => {
    // Dummy login without backend
    setToken('guest-token-12345');
    setUser({ id: 'guest-123', email: 'guest@example.com' });
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto w-full max-w-sm py-10">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" requiredIndicator>
            Email
          </Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email?.message ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" requiredIndicator>
            Password
          </Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password?.message ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-4">
        <Button onClick={handleGuestLogin} variant="outline" className="w-full">
          Continue as Guest
        </Button>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-primary underline-offset-4 hover:underline">
          Register
        </a>
      </p>
    </div>
  );
}
