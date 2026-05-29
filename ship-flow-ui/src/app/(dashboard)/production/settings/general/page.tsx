'use client';

import * as React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeSeriesCard } from './components/CodeSeriesCard';
import { DefaultsCard } from './components/DefaultsCard';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import config from './data/code-series-config.json';

type CodeSeriesValues = {
  prefix: string;
  suffix?: string;
  digits: number;
};

type DefaultsValues = {
  baseCurrency: string;
  paymentTerms: string;
};

export default function GeneralSettingsPage() {
  const [saving, setSaving] = React.useState(false);

  const [codeSeries, setCodeSeries] = React.useState<Record<string, CodeSeriesValues>>(() => {
    const initial: Record<string, CodeSeriesValues> = {};
    config.codeSeries.forEach((series) => {
      initial[series.id] = {
        prefix: series.fields.prefix.value,
        suffix: series.fields.suffix.value,
        digits: series.fields.digits.value,
      };
    });
    return initial;
  });

  const [defaults, setDefaults] = React.useState<DefaultsValues>({
    baseCurrency: config.defaults.baseCurrency.value,
    paymentTerms: config.defaults.paymentTerms.value,
  });

  const handleCodeSeriesChange = (id: string, values: CodeSeriesValues) => {
    setCodeSeries((prev) => ({
      ...prev,
      [id]: values,
    }));
  };

  const handleDefaultsChange = (values: DefaultsValues) => {
    setDefaults(values);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        codeSeries: Object.entries(codeSeries).map(([id, values]) => ({
          documentType: id.toUpperCase().replace(/-/g, '_'),
          ...values,
        })),
        defaults,
      };

      await api.put('/production-settings', payload);

      toast.success('Settings saved successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">General Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure code series, default currency, and payment terms.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="self-start gap-2 rounded-[5px] px-4"
        >
          <Save data-icon="inline-start" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="flex h-[1029px] w-[1024px] flex-col gap-4">
        <CodeSeriesCard values={codeSeries} onChange={handleCodeSeriesChange} />
        <DefaultsCard values={defaults} onChange={handleDefaultsChange} />
      </div>
    </div>
  );
}
