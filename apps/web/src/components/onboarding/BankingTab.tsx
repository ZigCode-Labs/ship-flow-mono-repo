'use client';

import * as React from 'react';
import { z } from 'zod';
import { Separator } from '@shipflow/ui';
import { FormInput, FormTextarea, useZodForm } from '@shipflow/ui-forms';
import { api } from '@/lib/api';
import { useActiveOrgStore } from '@/store/organization';
import { SectionHeader, FieldGrid, SaveBar } from './shared';

const schema = z.object({
  bankName: z.string().max(150).optional(),
  bankAccountNo: z.string().max(18).optional(),
  bankIFSC: z.string().max(11).optional(),
  swiftCode: z.string().max(11).optional(),
  bankAddress: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const bankingFields: { name: keyof FormValues; label: string; placeholder: string; colSpan?: 2 }[] = [
  { name: 'bankName', label: 'Bank Name', placeholder: 'State Bank of India', colSpan: 2 },
  { name: 'bankAccountNo', label: 'Account Number', placeholder: '1234567890', colSpan: 2 },
  { name: 'bankIFSC', label: 'IFSC Code', placeholder: 'SBIN0001234' },
  { name: 'swiftCode', label: 'SWIFT Code', placeholder: 'SBININBB123' },
];

export function BankingTab() {
  const activeOrg = useActiveOrgStore((s) => s.activeOrg);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const { control, reset, handleSubmit } = useZodForm({ schema });

  React.useEffect(() => {
    if (!activeOrg?.id) return;
    api.get<Record<string, unknown>>(`/organizations/${activeOrg.id}`)
      .then((org) => {
        reset({
          bankName: (org.bankName as string) ?? '',
          bankAccountNo: (org.bankAccountNo as string) ?? '',
          bankIFSC: (org.bankIFSC as string) ?? '',
          swiftCode: (org.swiftCode as string) ?? '',
          bankAddress: (org.bankAddress as string) ?? '',
        });
      })
      .catch(() => {});
  }, [activeOrg?.id, reset]);

  async function onSubmit(values: FormValues) {
    if (!activeOrg?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch(`/organizations/${activeOrg.id}`, values);
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
          title="Banking Information"
          description="Bank account details for export transactions"
        />
        <Separator />
        <FieldGrid>
          {bankingFields.map((f) =>
            f.colSpan === 2 ? (
              <FormInput
                key={f.name}
                control={control}
                name={f.name}
                label={f.label}
                placeholder={f.placeholder}
                className="sm:col-span-2"
              />
            ) : (
              <FormInput key={f.name} control={control} name={f.name} label={f.label} placeholder={f.placeholder} />
            ),
          )}
        </FieldGrid>
        <FormTextarea
          control={control}
          name="bankAddress"
          label="Bank Address"
          placeholder="Bank Branch Address"
          rows={3}
          resize="vertical"
        />
      </div>
      <SaveBar saving={saving} error={error} success={success} />
    </form>
  );
}
