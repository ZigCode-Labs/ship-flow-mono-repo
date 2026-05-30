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
import { useActiveOrgStore, useOrgSetupStore } from '@/store/organization';

const schema = z
  .object({
    firstName: z.string().min(2, 'Enter your first name'),
    lastName: z.string().min(2, 'Enter your last name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(12, 'At least 12 characters'),
    confirmPassword: z.string().min(12, 'At least 12 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveOrg = useActiveOrgStore((s) => s.setActiveOrg);
  const resetOrgSetup = useOrgSetupStore((s) => s.reset);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      const res = await api.post<{ token?: string; user?: { id: string; email: string } }>(
        '/auth/register',
        payload,
      );
      if (res?.token) {
        setToken(res.token);
        if (res.user) setUser(res.user);
        setActiveOrg(null);
        resetOrgSetup();
        router.push('/');
        return;
      }
      setSubmitSuccess('Registration successful. You can now log in.');
      setActiveOrg(null);
      resetOrgSetup();
      setTimeout(() => router.push('/login'), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setSubmitError(message);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl justify-center py-12">
      <div className="w-full max-w-md rounded-xl border bg-background/70 p-6 shadow-sm backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Start your plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your account to continue</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input id="firstName" placeholder="John" {...register('firstName')} />
            {errors.firstName?.message ? (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input id="lastName" placeholder="Doe" {...register('lastName')} />
            {errors.lastName?.message ? (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
            {errors.email?.message ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 12 characters"
                {...register('password')}
                className="pr-16"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-1 my-1 rounded-md px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password?.message ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                {...register('confirmPassword')}
                className="pr-16"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-1 my-1 rounded-md px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword?.message ? (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          {submitSuccess ? <p className="text-sm text-green-600">{submitSuccess}</p> : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Starting your plan...' : 'Start Plan'}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up, you agree to our{' '}
          <a className="text-primary underline-offset-4 hover:underline" href="/terms">
            Terms of Service
          </a>{' '}
          and{' '}
          <a className="text-primary underline-offset-4 hover:underline" href="/privacy">
            Privacy Policy
          </a>
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
