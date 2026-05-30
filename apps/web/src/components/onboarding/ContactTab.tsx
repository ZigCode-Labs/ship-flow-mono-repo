'use client';

import * as React from 'react';
import { z } from 'zod';
import { Upload, Pencil } from 'lucide-react';
import { Separator, Button } from '@shipflow/ui';
import { FormInput, FormTextarea, useZodForm } from '@shipflow/ui-forms';
import type { InputType } from '@shipflow/ui-forms';
import { api, API_BASE_URL } from '@/lib/api';
import { useActiveOrgStore } from '@/store/organization';
import { SectionHeader, FieldGrid, SaveBar } from './shared';

const schema = z.object({
  email: z.string().email().or(z.literal('')).optional(),
  fax: z.string().max(20).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  phone: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  addressLine2: z.string().max(255).optional(),
  phone2: z.string().max(20).optional(),
  phone3: z.string().max(20).optional(),
  authorizedSignatoryName: z.string().max(150).optional(),
  authorizedSignatoryDesignation: z.string().max(150).optional(),
});

type FormValues = z.infer<typeof schema>;

const contactFields: { name: keyof FormValues; label: string; placeholder: string; type?: InputType; colSpan?: 2 }[] = [
  { name: 'email', label: 'Email', placeholder: 'company@example.com', type: 'email', colSpan: 2 },
  { name: 'fax', label: 'Fax', placeholder: 'Fax Number' },
  { name: 'website', label: 'Website', placeholder: 'https://www.example.com', type: 'url' },
  { name: 'phone', label: 'Phone', placeholder: '+91 9099887776', type: 'tel' },
  { name: 'country', label: 'Country', placeholder: 'India' },
  { name: 'pincode', label: 'PIN Code', placeholder: '400001' },
  { name: 'city', label: 'City', placeholder: 'Auto-filled from PIN' },
  { name: 'state', label: 'State', placeholder: 'Auto-filled from PIN' },
];

const addressFields: { name: keyof FormValues; label: string; placeholder: string }[] = [
  { name: 'phone2', label: 'Phone 2', placeholder: '+91 00000 00000' },
  { name: 'phone3', label: 'Phone 3', placeholder: '+91 00000 00000' },
  { name: 'authorizedSignatoryName', label: 'Authorized Signatory', placeholder: 'Full Name' },
  { name: 'authorizedSignatoryDesignation', label: 'Designation', placeholder: 'Managing Director' },
];

export function ContactTab() {
  const activeOrg = useActiveOrgStore((s) => s.activeOrg);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [signatureFile, setSignatureFile] = React.useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(null);

  const { control, reset, handleSubmit } = useZodForm({ schema });

  React.useEffect(() => {
    if (!activeOrg?.id) return;
    api.get<FormValues & { signatureUrl?: string }>(`/organizations/${activeOrg.id}`)
      .then((org) => {
        reset({
          email: org.email ?? '',
          fax: (org as Record<string, unknown>).fax as string ?? '',
          website: org.website ?? '',
          phone: org.phone ?? '',
          country: (org as Record<string, unknown>).country as string ?? 'India',
          pincode: (org as Record<string, unknown>).pincode as string ?? '',
          city: (org as Record<string, unknown>).city as string ?? '',
          state: (org as Record<string, unknown>).state as string ?? '',
          addressLine2: (org as Record<string, unknown>).addressLine2 as string ?? '',
          phone2: (org as Record<string, unknown>).phone2 as string ?? '',
          phone3: (org as Record<string, unknown>).phone3 as string ?? '',
          authorizedSignatoryName: (org as Record<string, unknown>).authorizedSignatoryName as string ?? '',
          authorizedSignatoryDesignation: (org as Record<string, unknown>).authorizedSignatoryDesignation as string ?? '',
        });
        if (org.signatureUrl) setSignaturePreview(`${API_BASE_URL}${org.signatureUrl}`);
      })
      .catch(() => {});
  }, [activeOrg?.id, reset]);

  function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: FormValues) {
    if (!activeOrg?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch(`/organizations/${activeOrg.id}`, values);

      if (signatureFile) {
        const formData = new FormData();
        formData.append('file', signatureFile);
        const token = (() => {
          try { return JSON.parse(localStorage.getItem('auth-store') ?? '{}')?.state?.token ?? null; } catch { return null; }
        })();
        await fetch(
          `${API_BASE_URL}/organizations/${activeOrg.id}/signature`,
          { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData },
        );
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <SectionHeader
          title="Contact Information"
          description="Your company's contact details and address"
        />
        <Separator />

        <FieldGrid>
          {contactFields.map((f) =>
            f.colSpan === 2 ? (
              <FormInput
                key={f.name}
                control={control}
                name={f.name}
                label={f.label}
                placeholder={f.placeholder}
                type={f.type}
                className="sm:col-span-2"
              />
            ) : (
              <FormInput
                key={f.name}
                control={control}
                name={f.name}
                label={f.label}
                placeholder={f.placeholder}
                type={f.type}
              />
            ),
          )}
        </FieldGrid>

        <FormTextarea
          control={control}
          name="addressLine2"
          label="Address"
          placeholder="Street address, building, etc."
          rows={2}
        />

        <FieldGrid>
          {addressFields.map((f) => (
            <FormInput key={f.name} control={control} name={f.name} label={f.label} placeholder={f.placeholder} type="tel" />
          ))}
        </FieldGrid>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-blue-600" />
          <SectionHeader
            title="Digital Signature"
            description="Upload your signature once - it will be used automatically in all export documents"
          />
        </div>
        <Separator />
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            Upload Signature
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleSignatureChange} />
          </label>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Type Signature
          </button>
        </div>
        {signaturePreview && (
          <img src={signaturePreview} alt="Signature preview" className="h-16 object-contain rounded border p-2 bg-gray-50" />
        )}
        <p className="text-xs text-muted-foreground">
          Tip: Use a clear signature image on white background (PNG or JPG, max 500KB). This signature will automatically appear on all your export documents including Bill of Exchange, Commercial Invoice, etc.
        </p>
      </div>

      <SaveBar saving={saving} error={error} success={success} />
    </form>
  );
}
