'use client';

import { useState } from 'react';
import DomesticBuyerForm from './DomesticBuyerForm';
import type { Buyer } from './DomesticBuyerForm';

interface AddDomesticBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  editingBuyer?: Buyer | null;
}

export default function AddDomesticBuyerModal({
  isOpen,
  onClose,
  onSubmit,
  editingBuyer,
}: AddDomesticBuyerModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[720px]">
        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <DomesticBuyerForm
          editingBuyer={editingBuyer}
          onCancel={() => {
            setError(null);
            onClose();
          }}
          onSubmit={async (data) => {
            try {
              setError(null);
              await onSubmit(data);
              onClose();
            } catch (error) {
              setError(error instanceof Error ? error.message : 'Failed to save buyer');
            }
          }}
          title={editingBuyer ? 'Edit Domestic Buyer' : 'Add Domestic Buyer'}
          description="Enter details for the Indian buyer with GST information"
          submitLabel={editingBuyer ? 'Update Buyer' : 'Add Buyer'}
        />
      </div>
    </div>
  );
}
