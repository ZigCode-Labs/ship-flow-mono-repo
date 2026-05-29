'use client';

import { Calculator, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CostSheetsHeaderProps {
  onCreateClick: () => void;
}

export function CostSheetsHeader({ onCreateClick }: CostSheetsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <Calculator className="mt-0.5 size-5 text-blue-600" />
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold leading-none text-gray-950">
            Production Cost Sheets
          </h1>
          <p className="text-sm text-slate-700">
            Compute total landed cost and export pricing for your products
          </p>
        </div>
      </div>

      <Button type="button" onClick={onCreateClick} className="h-10 self-start px-4 sm:self-auto">
        <Plus data-icon="inline-start" />
        New Cost Sheet
      </Button>
    </header>
  );
}
