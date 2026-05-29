'use client';

import { Calculator, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CostSheetsEmptyStateProps {
  onCreateClick: () => void;
}

export function CostSheetsEmptyState({ onCreateClick }: CostSheetsEmptyStateProps) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 pt-22 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-lg border border-gray-200 bg-white px-7 py-8 text-center shadow-sm">
        <Calculator className="size-11 text-gray-400" strokeWidth={1.75} />

        <h2 className="mt-6 text-lg font-semibold leading-none text-gray-950">
          No cost sheets yet
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-5 text-slate-700">
          Create your first cost sheet to compute the total landed cost of an exported item.
        </p>

        <Button type="button" onClick={onCreateClick} className="mt-6 h-10 px-4">
          <Plus data-icon="inline-start" />
          Create First Cost Sheet
        </Button>
      </div>
    </div>
  );
}
