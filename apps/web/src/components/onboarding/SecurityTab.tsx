'use client';

import * as React from 'react';
import { z } from 'zod';
import { Upload, ShieldCheck, ShieldOff, Eye, EyeOff } from 'lucide-react';
import { Separator, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Avatar, AvatarFallback, AvatarImage } from '@shipflow/ui';
import { FormInput, useZodForm } from '@shipflow/ui-forms';
import { api, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { SectionHeader, SaveBar } from './shared';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(12, 'Minimum 12 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const emailSchema = z.object({
  newEmail: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

const totpSchema = z.object({
  token: z.string().length(6, '6 digits required').regex(/^\d+$/, 'Digits only'),
});

type TwoFaSetupData = { qrCodeDataUrl: string; secret: string };
type UserProfile = { id: string; email: string; firstName?: string | null; lastName?: string | null; profilePhotoUrl?: string | null; twoFactorEnabled: boolean };

export function SecurityTab() {
  const { token, logout } = useAuthStore((s) => ({ token: s.token, logout: s.logout }));
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  const [photoSaving, setPhotoSaving] = React.useState(false);
  const [pwSaving, setPwSaving] = React.useState(false);
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = React.useState(false);
  const [emailSaving, setEmailSaving] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = React.useState(false);

  const [twoFaSetup, setTwoFaSetup] = React.useState<TwoFaSetupData | null>(null);
  const [showTwoFaDialog, setShowTwoFaDialog] = React.useState(false);
  const [showDisableDialog, setShowDisableDialog] = React.useState(false);
  const [twoFaLoading, setTwoFaLoading] = React.useState(false);
  const [twoFaError, setTwoFaError] = React.useState<string | null>(null);

  const [showNewPw, setShowNewPw] = React.useState(false);

  const pwForm = useZodForm({ schema: passwordSchema });
  const emailForm = useZodForm({ schema: emailSchema });
  const totpEnableForm = useZodForm({ schema: totpSchema });
  const totpDisableForm = useZodForm({ schema: totpSchema });

  React.useEffect(() => {
    api.get<UserProfile>('/users/me')
      .then(setProfile)
      .catch(() => {});
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setPhotoSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9000'}/users/me/photo`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const data = await res.json();
      if (data.url) setProfile((p) => p ? { ...p, profilePhotoUrl: data.url } : p);
    } finally {
      setPhotoSaving(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setPwSaving(true);
    setPwError(null);
    setPwSuccess(false);
    try {
      await api.post('/users/me/change-password', values);
      setPwSuccess(true);
      pwForm.reset();
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  }

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setEmailSaving(true);
    setEmailError(null);
    setEmailSuccess(false);
    try {
      await api.post('/users/me/change-email', values);
      setEmailSuccess(true);
      setTimeout(() => { logout(); window.location.href = '/login'; }, 2000);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Failed to change email');
    } finally {
      setEmailSaving(false);
    }
  }

  async function handle2faSetup() {
    setTwoFaLoading(true);
    setTwoFaError(null);
    try {
      const data = await api.post<TwoFaSetupData>('/users/me/2fa/setup', {});
      setTwoFaSetup(data);
      setShowTwoFaDialog(true);
    } catch (e) {
      setTwoFaError(e instanceof Error ? e.message : 'Failed to set up 2FA');
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function onTotpVerify(values: z.infer<typeof totpSchema>) {
    setTwoFaLoading(true);
    setTwoFaError(null);
    try {
      await api.post('/users/me/2fa/verify', { token: values.token });
      setProfile((p) => p ? { ...p, twoFactorEnabled: true } : p);
      setShowTwoFaDialog(false);
      totpEnableForm.reset();
    } catch (e) {
      setTwoFaError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function onTotpDisable(values: z.infer<typeof totpSchema>) {
    setTwoFaLoading(true);
    setTwoFaError(null);
    try {
      await apiFetch('/users/me/2fa', { method: 'DELETE', body: { token: values.token } });
      setProfile((p) => p ? { ...p, twoFactorEnabled: false } : p);
      setShowDisableDialog(false);
      totpDisableForm.reset();
    } catch (e) {
      setTwoFaError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setTwoFaLoading(false);
    }
  }

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || profile.email[0].toUpperCase()
    : 'U';

  const photoSrc = profile?.profilePhotoUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9000'}${profile.profilePhotoUrl}`
    : undefined;

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <SectionHeader title="Profile Picture" description="Upload your profile photo (recommended: 200x200px, max 2MB)" />
        <Separator />
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {photoSrc && <AvatarImage src={photoSrc} alt="Profile" />}
            <AvatarFallback className="bg-emerald-500 text-white text-lg font-medium">{initials}</AvatarFallback>
          </Avatar>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            {photoSaving ? 'Uploading…' : 'Select Photo'}
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)}>
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <SectionHeader title="Change Password" description="Update your account password" />
          <Separator />
          <FormInput control={pwForm.control} name="currentPassword" label="Current Password" placeholder="Enter your current password" type="password" />
          <div className="relative">
            <FormInput
              control={pwForm.control}
              name="newPassword"
              label="New Password"
              placeholder="Enter new password (min 12 characters)"
              type={showNewPw ? 'text' : 'password'}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNewPw((v) => !v)}
            >
              {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FormInput control={pwForm.control} name="confirmPassword" label="Confirm New Password" placeholder="Confirm new password" type="password" />
        </div>
        <SaveBar saving={pwSaving} error={pwError} success={pwSuccess} label="Change Password" />
      </form>

      {/* Change Email */}
      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <SectionHeader title="Change Email Address" description="Update your login email address" />
          <Separator />
          <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span className="font-medium">Current Email Address:</span> {profile?.email ?? '—'}
          </div>
          <FormInput control={emailForm.control} name="newEmail" label="New Email Address" placeholder="Enter new email address" type="email" />
          <FormInput control={emailForm.control} name="password" label="Confirm with Password" placeholder="Enter your password" type="password" />
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <strong>Note:</strong> After changing your email, you will be logged out and need to sign in again with your new email address.
          </div>
        </div>
        <SaveBar saving={emailSaving} error={emailError} success={emailSuccess} label="Change Email" />
      </form>

      {/* Two-Factor Authentication */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-500" />
            <SectionHeader title="Two-Factor Authentication" description="Add an extra layer of security to your account using an authenticator app" />
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${profile?.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {profile?.twoFactorEnabled ? '● Enabled' : '○ Disabled'}
          </span>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Two-factor authentication adds an additional layer of security by requiring a code from your authenticator app when signing in.
        </p>
        {twoFaError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{twoFaError}</div>
        )}
        {profile?.twoFactorEnabled ? (
          <Button variant="destructive" size="sm" className="gap-2" onClick={() => { setTwoFaError(null); setShowDisableDialog(true); }}>
            <ShieldOff className="h-4 w-4" />
            Disable Two-Factor Authentication
          </Button>
        ) : (
          <Button variant="default" size="sm" className="gap-2" onClick={handle2faSetup} disabled={twoFaLoading}>
            <ShieldCheck className="h-4 w-4" />
            {twoFaLoading ? 'Setting up…' : 'Enable Two-Factor Authentication'}
          </Button>
        )}
      </div>

      {/* 2FA Enable Dialog */}
      <Dialog open={showTwoFaDialog} onOpenChange={setShowTwoFaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {twoFaSetup?.qrCodeDataUrl && (
              <div className="flex justify-center">
                <img src={twoFaSetup.qrCodeDataUrl} alt="2FA QR Code" className="h-48 w-48 rounded border p-1" />
              </div>
            )}
            <p className="text-xs text-center text-muted-foreground">Can&apos;t scan? Enter this code manually: <code className="font-mono bg-gray-100 px-1 rounded">{twoFaSetup?.secret}</code></p>
            <form onSubmit={totpEnableForm.handleSubmit(onTotpVerify)} className="space-y-3">
              <FormInput
                control={totpEnableForm.control}
                name="token"
                label="Verification Code"
                placeholder="000000"
                inputClassName="text-center text-xl tracking-widest font-mono"
              />
              {twoFaError && (
                <p className="text-sm text-destructive">{twoFaError}</p>
              )}
              <Button type="submit" className="w-full" disabled={twoFaLoading}>
                {twoFaLoading ? 'Verifying…' : 'Verify & Enable 2FA'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>Enter the 6-digit code from your authenticator app to confirm disabling 2FA.</DialogDescription>
          </DialogHeader>
          <form onSubmit={totpDisableForm.handleSubmit(onTotpDisable)} className="space-y-3">
            <FormInput
              control={totpDisableForm.control}
              name="token"
              label="Verification Code"
              placeholder="000000"
              inputClassName="text-center text-xl tracking-widest font-mono"
            />
            {twoFaError && <p className="text-sm text-destructive">{twoFaError}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" className="flex-1" disabled={twoFaLoading}>
                {twoFaLoading ? 'Disabling…' : 'Disable 2FA'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
