'use client';

import * as React from 'react';
import { z } from 'zod';
import { Separator } from '@shipflow/ui';
import { FormInput, FormTextarea, useZodForm } from '@shipflow/ui-forms';
import { api } from '@/lib/api';
import { useActiveOrgStore } from '@/store/organization';
import { SectionHeader, FieldGrid, SaveBar } from './shared';

const schema = z.object({
  rcmcNumber: z.string().max(50).optional(),
  dgftAuth: z.string().max(100).optional(),
  tanNumber: z.string().max(20).optional(),
  ircNo: z.string().max(50).optional(),
  portRegistrationNumber: z.string().max(50).optional(),
  sedexRegistrationNumber: z.string().max(50).optional(),
  complianceNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const complianceFields: { name: keyof Omit<FormValues, 'complianceNotes'>; label: string; placeholder: string }[] = [
  { name: 'rcmcNumber', label: 'RCMC Number', placeholder: 'Registration Cum Membership Certificate' },
  { name: 'dgftAuth', label: 'DGFT Authorization', placeholder: 'Director General of Foreign Trade' },
  { name: 'tanNumber', label: 'TAN Number', placeholder: 'Tax Deduction Account Number' },
  { name: 'ircNo', label: 'IRC No', placeholder: 'Importer Record Code' },
  { name: 'portRegistrationNumber', label: 'Port Registration Number', placeholder: 'Port Authority Registration' },
  { name: 'sedexRegistrationNumber', label: 'Sedex Registration Number', placeholder: 'Sedex Member Number' },
];

export function ComplianceTab() {
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
          rcmcNumber: (org.rcmcNumber as string) ?? '',
          dgftAuth: (org.dgftAuth as string) ?? '',
          tanNumber: (org.tanNumber as string) ?? '',
          ircNo: (org.ircNo as string) ?? '',
          portRegistrationNumber: (org.portRegistrationNumber as string) ?? '',
          sedexRegistrationNumber: (org.sedexRegistrationNumber as string) ?? '',
          complianceNotes: (org.complianceNotes as string) ?? '',
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
          title="Compliance & Registrations"
          description="Export licenses and compliance certificates"
        />
        <Separator />
        <FieldGrid>
          {complianceFields.map((f) => (
            <FormInput key={f.name} control={control} name={f.name} label={f.label} placeholder={f.placeholder} />
          ))}
        </FieldGrid>
        <FormTextarea
          control={control}
          name="complianceNotes"
          label="Additional Notes"
          placeholder="Any additional information..."
          rows={4}
          resize="vertical"
        />
      </div>
      <SaveBar saving={saving} error={error} success={success} />
    </form>
  );
}
