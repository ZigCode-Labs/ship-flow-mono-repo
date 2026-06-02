'use client';

import * as React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@shipflow/ui';

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {children}
    </div>
  );
}

export function SaveBar({
  saving,
  error,
  success,
  label = 'Save Profile',
}: {
  saving: boolean;
  error: string | null;
  success: boolean;
  label?: string;
}) {
  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Saved successfully
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" className="gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : label}
        </Button>
      </div>
    </div>
  );
}
