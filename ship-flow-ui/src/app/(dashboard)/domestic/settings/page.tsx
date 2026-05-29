'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DocumentSettingsCard } from './components/DocumentSettingsCard';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DocumentSettings = {
  prefix: string;
  digits: number;
  startingNumber: number;
};

export default function DomesticSettingsPage() {
  const [taxInvoice, setTaxInvoice] = React.useState<DocumentSettings>({
    prefix: 'INV',
    digits: 5,
    startingNumber: 1,
  });

  const [domesticProforma, setDomesticProforma] = React.useState<DocumentSettings>({
    prefix: 'PRO',
    digits: 5,
    startingNumber: 1,
  });

  const [creditNote, setCreditNote] = React.useState<DocumentSettings>({
    prefix: 'CRN',
    digits: 5,
    startingNumber: 1,
  });

  const [deliveryChallan, setDeliveryChallan] = React.useState<DocumentSettings>({
    prefix: 'DC',
    digits: 5,
    startingNumber: 1,
  });

  const [saving, setSaving] = React.useState(false);

  // Use a ref to store the latest values from the forms without causing re-renders
  const formValuesRef = React.useRef({
    taxInvoice,
    domesticProforma,
    creditNote,
    deliveryChallan,
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${API_URL}/document-settings`);
        if (res.ok) {
          const data = await res.json();
          data.forEach((setting: any) => {
            const settingData = {
              prefix: setting.prefix,
              digits: setting.digits,
              startingNumber: setting.startingNumber,
            };
            if (setting.documentType === 'TAX_INVOICE') {
              setTaxInvoice(settingData);
              formValuesRef.current.taxInvoice = settingData;
            }
            if (setting.documentType === 'DOMESTIC_PROFORMA') {
              setDomesticProforma(settingData);
              formValuesRef.current.domesticProforma = settingData;
            }
            if (setting.documentType === 'CREDIT_NOTE') {
              setCreditNote(settingData);
              formValuesRef.current.creditNote = settingData;
            }
            if (setting.documentType === 'DELIVERY_CHALLAN') {
              setDeliveryChallan(settingData);
              formValuesRef.current.deliveryChallan = settingData;
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleTaxInvoiceSubmit = React.useCallback((values: DocumentSettings) => {
    formValuesRef.current.taxInvoice = values;
  }, []);

  const handleDomesticProformaSubmit = React.useCallback((values: DocumentSettings) => {
    formValuesRef.current.domesticProforma = values;
  }, []);

  const handleCreditNoteSubmit = React.useCallback((values: DocumentSettings) => {
    formValuesRef.current.creditNote = values;
  }, []);

  const handleDeliveryChallanSubmit = React.useCallback((values: DocumentSettings) => {
    formValuesRef.current.deliveryChallan = values;
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const payload = [
        { documentType: 'TAX_INVOICE', ...formValuesRef.current.taxInvoice },
        { documentType: 'DOMESTIC_PROFORMA', ...formValuesRef.current.domesticProforma },
        { documentType: 'CREDIT_NOTE', ...formValuesRef.current.creditNote },
        { documentType: 'DELIVERY_CHALLAN', ...formValuesRef.current.deliveryChallan },
      ];

      const res = await fetch(`${API_URL}/document-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }

      toast.success('Settings saved successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex flex-col space-y-1">
          <h1 className="text-lg font-semibold">Domestic Document Settings</h1>
          <p className="text-xs text-muted-foreground">
            Configure number series for all domestic documents
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-[5px]">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5">
          <Card className="rounded-[5px] border-yellow-200 bg-white text-yellow-900 shadow-none">
            <CardContent className="flex gap-2 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-900">
                Changing a prefix applies to new documents only. Documents already created keep
                their original numbers. If you change a prefix mid-year, numbering restarts from the
                Starting Number you set for that new prefix. The Starting Number is only used when
                no documents exist yet for that prefix + financial year - if documents already
                exist, the next number is always derived from the last existing one.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-6 pb-6">
            <DocumentSettingsCard
              title="Tax Invoice"
              description="Used for GST-compliant domestic sales invoices"
              initialValues={taxInvoice}
              onSubmit={handleTaxInvoiceSubmit}
            />

            <DocumentSettingsCard
              title="Domestic Proforma"
              description="Preliminary invoice before final shipment"
              initialValues={domesticProforma}
              onSubmit={handleDomesticProformaSubmit}
            />

            <DocumentSettingsCard
              title="Credit Note"
              description="Issued for returns or invoice corrections"
              initialValues={creditNote}
              onSubmit={handleCreditNoteSubmit}
            />

            <DocumentSettingsCard
              title="Delivery Challan"
              description="Proof of goods delivery without payment"
              initialValues={deliveryChallan}
              onSubmit={handleDeliveryChallanSubmit}
            />
          </div>

          <p className="pb-6 text-center text-xs text-muted-foreground">
            Financial year suffix is computed automatically from the current date - the preview
            above shows the current financial year.
          </p>
        </div>
      </div>
    </div>
  );
}
