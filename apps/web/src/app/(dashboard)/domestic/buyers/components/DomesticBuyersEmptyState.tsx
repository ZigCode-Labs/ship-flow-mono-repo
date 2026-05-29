'use client';

import { Plus } from 'lucide-react';

interface DomesticBuyersEmptyStateProps {
  onAddBuyer: () => void;
  message?: string;
}

export default function DomesticBuyersEmptyState({
  onAddBuyer,
  message = 'Add your first domestic buyer with GST details',
}: DomesticBuyersEmptyStateProps) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-white px-4 py-14 text-center">
      <div className="text-5xl font-light text-gray-300">₹</div>
      <h2 className="mt-4 text-base font-semibold text-gray-900">No Domestic Buyers</h2>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onAddBuyer}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Plus size={16} />
        Add Domestic Buyer
      </button>
    </div>
  );
}
