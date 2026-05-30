'use client';

import * as React from 'react';
import { z } from 'zod';
import { CheckCircle2, Lock, Info } from 'lucide-react';
import { Separator, Button } from '@shipflow/ui';
import { FormTextarea, useZodForm } from '@shipflow/ui-forms';
import { api } from '@/lib/api';
import { useActiveOrgStore } from '@/store/organization';
import { SectionHeader, SaveBar } from './shared';

const INDUSTRY_TYPES = [
  { value: '', label: '— Select your industry —' },
  { value: 'ceramic_tiles', label: 'Ceramic Tiles' },
  { value: 'textile', label: 'Textile & Garments' },
  { value: 'engineering', label: 'Engineering Goods' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'gems_jewelry', label: 'Gems & Jewelry' },
  { value: 'scrap_ferrous', label: 'Scrap & Ferrous Products' },
  { value: 'food_agriculture', label: 'Food & Agriculture' },
  { value: 'it_electronics', label: 'IT & Electronics' },
  { value: 'auto_parts', label: 'Automobile Parts' },
  { value: 'other', label: 'Other' },
];

const DOCUMENT_SETS = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Default document set. Works for all general trading exporters.',
    icons: ['PI', 'CI', 'PL', 'SI'],
  },
  {
    value: 'ceramic_tiles',
    label: 'Ceramic Tiles',
    description: 'Includes RCMC, movement, freight & insurance fields across all docs.',
    icons: ['PI', 'CI', 'PL', '+Documents'],
  },
  {
    value: 'scrap_ferrous',
    label: 'Scrap & Ferrous Products',
    description: 'For exporters of ferrous scrap, sponge iron, HMS and related bulk commodity.',
    icons: ['PI', 'CI', 'PL'],
  },
];

const CORE_DOCUMENTS = [
  { name: 'proforma_invoice', label: 'Proforma Invoice', description: 'Pre-shipment proforma document', isCore: true },
  { name: 'commercial_invoice', label: 'Commercial Invoice', description: 'Final export invoices', isCore: true },
  { name: 'sample_invoice', label: 'Sample Invoice', description: 'Invoice for product samples', isCore: true },
  { name: 'packing_list', label: 'Packing List', description: 'Detail package contents', isCore: true },
];

const OPTIONAL_DOCUMENTS = [
  { name: 'bill_of_exchange', label: 'Bill of Exchange', description: 'Draft/Bill for payment', isCore: false },
  { name: 'bill_of_lading', label: 'Bill of Lading', description: 'Bill of lading document', isCore: false },
  { name: 'shipping_instructions', label: 'Shipping Instructions', description: 'Instructions for shipping agents', isCore: false },
  { name: 'certificates', label: 'Certificates', description: 'Origin & compliance certificates', isCore: false },
  { name: 'other_documents', label: 'Other Documents', description: 'Required as per trade terms', isCore: false },
];

const defaultTextSchema = z.object({
  defaultAdditionalDetails: z.string().optional(),
  defaultDescriptionOfGoods: z.string().optional(),
  defaultAdditionalInfo: z.string().optional(),
  defaultFreightBasis: z.string().optional(),
});

type DefaultTextValues = z.infer<typeof defaultTextSchema>;

type ActiveDocState = Record<string, boolean>;

type ExportSettings = {
  industryType?: string | null;
  documentSet?: string | null;
  defaultAdditionalDetails?: string | null;
  defaultDescriptionOfGoods?: string | null;
  defaultAdditionalInfo?: string | null;
  defaultFreightBasis?: string | null;
  activeDocuments?: { documentName: string; isEnabled: boolean }[];
};

export function TemplatesTab() {
  const activeOrg = useActiveOrgStore((s) => s.activeOrg);
  const [industryType, setIndustryType] = React.useState('');
  const [documentSet, setDocumentSet] = React.useState('standard');
  const [activeDocs, setActiveDocs] = React.useState<ActiveDocState>(() => {
    const s: ActiveDocState = {};
    CORE_DOCUMENTS.forEach((d) => { s[d.name] = true; });
    OPTIONAL_DOCUMENTS.forEach((d) => { s[d.name] = false; });
    return s;
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const textForm = useZodForm({ schema: defaultTextSchema });

  React.useEffect(() => {
    if (!activeOrg?.id) return;
    api.get<ExportSettings>(`/organizations/${activeOrg.id}/export-settings`)
      .then((data) => {
        setIndustryType(data.industryType ?? '');
        setDocumentSet(data.documentSet ?? 'standard');
        textForm.reset({
          defaultAdditionalDetails: data.defaultAdditionalDetails ?? '',
          defaultDescriptionOfGoods: data.defaultDescriptionOfGoods ?? '',
          defaultAdditionalInfo: data.defaultAdditionalInfo ?? '',
          defaultFreightBasis: data.defaultFreightBasis ?? '',
        });
        if (data.activeDocuments?.length) {
          const newState: ActiveDocState = { ...activeDocs };
          data.activeDocuments.forEach((d) => { newState[d.documentName] = d.isEnabled; });
          setActiveDocs(newState);
        }
      })
      .catch(() => {});
  }, [activeOrg?.id]);

  async function handleSave(textValues: DefaultTextValues) {
    if (!activeOrg?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch(`/organizations/${activeOrg.id}/export-settings`, {
        industryType,
        documentSet,
        ...textValues,
      });

      const documents = [...CORE_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map((d) => ({
        documentName: d.name,
        isEnabled: d.isCore ? true : (activeDocs[d.name] ?? false),
      }));
      await api.patch(`/organizations/${activeOrg.id}/export-settings/active-documents`, { documents });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function toggleDoc(name: string) {
    setActiveDocs((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <form onSubmit={textForm.handleSubmit(handleSave)} className="space-y-6">
      {/* Industry Type */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <SectionHeader title="Export Industry" description="Select your industry to load the matching document set. This currently selects fields and columns appear across all your export documents." />
        </div>
        <Separator />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry Type *</label>
          <select
            value={industryType}
            onChange={(e) => setIndustryType(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {INDUSTRY_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">Changing industry updates your document set and available templates.</p>
        </div>
      </div>

      {/* Document Set */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <SectionHeader title="Document Set" description="Your core document set - pre-configured per your industry. These are exactly how they will look before saving." />
        <Separator />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENT_SETS.map((set) => (
            <button
              key={set.value}
              type="button"
              onClick={() => setDocumentSet(set.value)}
              className={`relative rounded-xl border-2 p-4 text-left transition-colors ${documentSet === set.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              {documentSet === set.value && (
                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-blue-600" />
              )}
              <p className="font-medium text-sm text-gray-900">{set.label}</p>
              <p className="text-xs text-gray-500 mt-1">{set.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {set.icons.map((icon) => (
                  <span key={icon} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600">{icon}</span>
                ))}
              </div>
              <button type="button" className="mt-2 text-xs text-blue-600 hover:underline">↗ Preview Documents</button>
            </button>
          ))}
        </div>
      </div>

      {/* Active Documents */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <SectionHeader title="Active Documents" description="These documents are always included. Enable optional and industry-specific documents you need to print in your document addition." />
        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Core Documents</p>
          <div className="space-y-2">
            {CORE_DOCUMENTS.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock className="h-3 w-3" />
                  Core
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Optional Documents</p>
          <div className="space-y-2">
            {OPTIONAL_DOCUMENTS.map((doc) => (
              <div
                key={doc.name}
                onClick={() => toggleDoc(doc.name)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${activeDocs[doc.name] ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </div>
                <div className={`h-5 w-9 rounded-full transition-colors ${activeDocs[doc.name] ? 'bg-blue-600' : 'bg-gray-200'} flex items-center px-0.5`}>
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${activeDocs[doc.name] ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Default Text */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <SectionHeader
          title="Default Text"
          description="Set defaults that will be pre-filled whenever you create new documents. You can always override these as a per-document basis."
        />
        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Proforma Invoice, Commercial Invoice & Packing List</p>
          <p className="text-xs text-muted-foreground">When you create an Additional Details field whenever you create a new Proforma Invoice, Commercial Invoice, or Packing List.</p>
          <FormTextarea
            control={textForm.control}
            name="defaultAdditionalDetails"
            label="Additional Details (optional)"
            placeholder="e.g. All goods are subject to our standard terms and conditions: T&OC"
            rows={3}
            resize="vertical"
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Annexure Defaults</p>
          <p className="text-xs text-muted-foreground">When you create an annexure these defaults will be pre-filled as the last entry.</p>
          <FormTextarea
            control={textForm.control}
            name="defaultDescriptionOfGoods"
            label="Description of Goods"
            placeholder="e.g. Glazed vitrified ceramic floor and wall tile, manufactured from natural raw materials."
            rows={3}
            resize="vertical"
          />
          <FormTextarea
            control={textForm.control}
            name="defaultAdditionalInfo"
            label="Additional Information (optional)"
            placeholder="e.g. All goods are packed in export-quality cardboard boxes, palletized and shrink-wrapped for safe sea freight"
            rows={3}
            resize="vertical"
          />
          <FormTextarea
            control={textForm.control}
            name="defaultFreightBasis"
            label="Freight Basis"
            placeholder="e.g. Subject to arbitration in India. All disputes under jurisdiction of courts in Mumbai"
            rows={2}
            resize="vertical"
          />
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 flex items-start gap-2 text-xs text-blue-700">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Don&apos;t see a document you need? <button type="button" className="underline ml-1">To submit a request via Support</button> and our team will evaluate adding it to your industry set.
        </div>
      </div>

      <SaveBar saving={saving} error={error} success={success} label="Save Templates" />
    </form>
  );
}
