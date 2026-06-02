'use client';

import * as React from 'react';
import { z } from 'zod';
import { Info, Mail, ExternalLink } from 'lucide-react';
import { Separator, Button, Switch } from '@shipflow/ui';
import { FormInput, FormTextarea, FormSwitch, useZodForm } from '@shipflow/ui-forms';
import { api } from '@/lib/api';
import { useActiveOrgStore } from '@/store/organization';
import { SectionHeader, FieldGrid, SaveBar } from './shared';

const smtpSchema = z.object({
  smtpEnabled: z.boolean().optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.coerce.number().int().min(1).max(65535).optional(),
  smtpFromEmail: z.string().email().or(z.literal('')).optional(),
  smtpFromName: z.string().max(100).optional(),
  smtpUseTls: z.boolean().optional(),
  emailReplyTo: z.string().email().or(z.literal('')).optional(),
});

const templateSchema = z.object({
  subjectTemplate: z.string().min(1, 'Subject is required'),
  bodyTemplate: z.string().min(1, 'Body is required'),
  defaultCc: z.string().optional(),
  defaultBcc: z.string().optional(),
});

type SmtpValues = z.infer<typeof smtpSchema>;
type TemplateValues = z.infer<typeof templateSchema>;

const DOC_TYPE_OPTIONS = [
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'proforma_invoice', label: 'Proforma Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'bill_of_exchange', label: 'Bill of Exchange' },
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'shipping_instructions', label: 'Shipping Instructions' },
  { value: 'certificates', label: 'Certificates' },
];

const TEMPLATE_VARIABLES = [
  '{{documentNumber}}',
  '{{buyerName}}',
  '{{exporterName}}',
  '{{amount}}',
  '{{currency}}',
  '{{date}}',
];

type OrgInfo = { smtpEnabled?: boolean; smtpFromName?: string; smtpFromEmail?: string; email?: string };

export function EmailConfigTab() {
  const activeOrg = useActiveOrgStore((s) => s.activeOrg);

  const [orgInfo, setOrgInfo] = React.useState<OrgInfo>({});
  const [smtpSaving, setSmtpSaving] = React.useState(false);
  const [smtpError, setSmtpError] = React.useState<string | null>(null);
  const [smtpSuccess, setSmtpSuccess] = React.useState(false);

  const [selectedDocType, setSelectedDocType] = React.useState('commercial_invoice');
  const [tplSaving, setTplSaving] = React.useState(false);
  const [tplError, setTplError] = React.useState<string | null>(null);
  const [tplSuccess, setTplSuccess] = React.useState(false);

  const smtpForm = useZodForm({ schema: smtpSchema, defaultValues: { smtpEnabled: false, smtpUseTls: true } });
  const tplForm = useZodForm({ schema: templateSchema, defaultValues: { subjectTemplate: '', bodyTemplate: '', defaultCc: '', defaultBcc: '' } });

  const smtpEnabled = smtpForm.watch('smtpEnabled');

  React.useEffect(() => {
    if (!activeOrg?.id) return;
    api.get<Record<string, unknown>>(`/organizations/${activeOrg.id}`)
      .then((org) => {
        setOrgInfo({ smtpEnabled: org.smtpEnabled as boolean, smtpFromName: org.smtpFromName as string, smtpFromEmail: org.smtpFromEmail as string, email: org.email as string });
        smtpForm.reset({
          smtpEnabled: Boolean(org.smtpEnabled),
          smtpHost: (org.smtpHost as string) ?? '',
          smtpPort: (org.smtpPort as number) ?? undefined,
          smtpFromEmail: (org.smtpFromEmail as string) ?? '',
          smtpFromName: (org.smtpFromName as string) ?? '',
          smtpUseTls: org.smtpUseTls !== false,
          emailReplyTo: (org.emailReplyTo as string) ?? '',
        });
      })
      .catch(() => {});
  }, [activeOrg?.id]);

  React.useEffect(() => {
    if (!activeOrg?.id) return;
    api.get<TemplateValues>(`/organizations/${activeOrg.id}/email-templates/${selectedDocType}`)
      .then((tpl) => {
        tplForm.reset({
          subjectTemplate: tpl.subjectTemplate ?? '',
          bodyTemplate: tpl.bodyTemplate ?? '',
          defaultCc: tpl.defaultCc ?? '',
          defaultBcc: tpl.defaultBcc ?? '',
        });
      })
      .catch(() => {});
  }, [activeOrg?.id, selectedDocType]);

  async function onSmtpSubmit(values: SmtpValues) {
    if (!activeOrg?.id) return;
    setSmtpSaving(true);
    setSmtpError(null);
    setSmtpSuccess(false);
    try {
      await api.patch(`/organizations/${activeOrg.id}`, values);
      setSmtpSuccess(true);
      setTimeout(() => setSmtpSuccess(false), 3000);
    } catch (e) {
      setSmtpError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSmtpSaving(false);
    }
  }

  async function onTemplateSubmit(values: TemplateValues) {
    if (!activeOrg?.id) return;
    setTplSaving(true);
    setTplError(null);
    setTplSuccess(false);
    try {
      await api.put(`/organizations/${activeOrg.id}/email-templates/${selectedDocType}`, values);
      setTplSuccess(true);
      setTimeout(() => setTplSuccess(false), 3000);
    } catch (e) {
      setTplError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setTplSaving(false);
    }
  }

  function insertVariable(variable: string) {
    const bodyVal = tplForm.getValues('bodyTemplate');
    tplForm.setValue('bodyTemplate', bodyVal + variable);
  }

  return (
    <div className="space-y-6">
      {/* Current Email Method */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600" />
          <SectionHeader title="Email Configuration" description="Configure how emails are sent from ExDocs to your buyers" />
        </div>
        <Separator />
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-1 text-sm">
          <p className="font-medium text-blue-900">Current Email Sending Method</p>
          <p className="text-blue-700">Sending Service: <span className="font-medium">ExDocs Email Service (Amazon SES)</span></p>
          <p className="text-blue-700">From Name: <span className="font-medium">{orgInfo.smtpFromName || activeOrg?.name || '—'}</span></p>
          <p className="text-blue-700">Reply-To Email: <span className="font-medium">{orgInfo.email || 'your@email.com'}</span></p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 flex items-start gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
          How it works: Emails are sent through our secure email service. Buyers receive documents from ExDocs, and all replies come to your email address. This ensures reliable delivery with zero technical setup on your part.
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
          <p className="font-medium">Want buyers to see your custom domain?</p>
          <p>Upgrade to <strong>Advanced</strong> or <strong>Professional</strong> plan to send emails from your own domain (e.g., info@yourcompany.com) for a more professional appearance.</p>
          <button type="button" className="mt-1 inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">
            <ExternalLink className="h-3 w-3" />
            View Upgrade Plans
          </button>
        </div>
      </div>

      {/* Custom SMTP */}
      <form onSubmit={smtpForm.handleSubmit(onSmtpSubmit)} className="space-y-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <SectionHeader title="Custom Email Server (SMTP)" description="Configure your own email server to send documents from your domain" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable Custom SMTP</p>
              <p className="text-xs text-muted-foreground">Use your own email template instead of the default ExDocs service</p>
            </div>
            <Switch
              checked={smtpEnabled ?? false}
              onCheckedChange={(v) => smtpForm.setValue('smtpEnabled', v)}
            />
          </div>

          {smtpEnabled && (
            <>
              <Separator />
              <FieldGrid>
                <FormInput control={smtpForm.control} name="smtpHost" label="SMTP Host" placeholder="smtp.gmail.com" />
                <FormInput control={smtpForm.control} name="smtpPort" label="SMTP Port" placeholder="587" type="number" />
                <FormInput control={smtpForm.control} name="smtpFromEmail" label="From Email" placeholder="noreply@company.com" type="email" />
                <FormInput control={smtpForm.control} name="smtpFromName" label="From Name" placeholder="Company Name" />
                <FormInput control={smtpForm.control} name="emailReplyTo" label="Reply-To Email" placeholder="support@company.com" type="email" />
              </FieldGrid>
              <FormSwitch control={smtpForm.control} name="smtpUseTls" label="Security" switchLabel="Use TLS / SSL" />
            </>
          )}
        </div>
        {smtpError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{smtpError}</div>
        )}
        {smtpSuccess && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Settings saved</div>
        )}
        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={smtpSaving} size="sm">
            {smtpSaving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Email Template Settings */}
      <form onSubmit={tplForm.handleSubmit(onTemplateSubmit)} className="space-y-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <SectionHeader title="Email Template Settings" description="Customize email templates for sending documents to buyers" />
          </div>
          <Separator />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {DOC_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Variables</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-mono text-gray-700 hover:bg-gray-100"
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click to copy. These will be replaced with actual values when sending emails.</p>
          </div>

          <FormInput
            control={tplForm.control}
            name="subjectTemplate"
            label="Subject Template"
            placeholder="Commercial Invoice {{documentNumber}} from {{exporterName}}"
            required
          />

          <FormTextarea
            control={tplForm.control}
            name="bodyTemplate"
            label="Body Template"
            placeholder="Dear {{buyerName}},..."
            rows={8}
            resize="vertical"
            required
          />

          <FieldGrid>
            <FormInput control={tplForm.control} name="defaultCc" label="Default CC (comma-separated)" placeholder="accounting@yourcompany.com, manager@yourcompany.com" />
            <FormInput control={tplForm.control} name="defaultBcc" label="Default BCC (comma-separated)" placeholder="notifications@yourcompany.com" />
          </FieldGrid>
        </div>

        {tplError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{tplError}</div>
        )}
        {tplSuccess && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Template saved</div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="submit" variant="outline" disabled={tplSaving} size="sm">
            {tplSaving ? 'Saving…' : 'Save Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}
