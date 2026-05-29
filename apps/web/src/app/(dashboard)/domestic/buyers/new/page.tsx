'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AddDomesticBuyerModal from '@/app/(dashboard)/domestic/buyers/components/AddDomesticBuyerModal';
import { useDomesticBuyersStore, type BuyerPayload } from '@/store/domesticBuyers';

export default function NewDomesticBuyerPage() {
  const router = useRouter();
  const addBuyer = useDomesticBuyersStore((state) => state.addBuyer);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setIsModalOpen(false);
    router.push('/domestic/buyers');
  };

  const handleCreateBuyer = async (formData: Record<string, string>) => {
    setError(null);
    try {
      await addBuyer({
        ...formData,
        status: 'active',
      } as BuyerPayload);
      setIsModalOpen(false);
      router.push('/domestic/buyers');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save buyer');
      throw error;
    }
  };

  return (
    <div className="h-full min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Buyer Management
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">New Domestic Buyer</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create a new buyer record with GST, address, bank, and contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

        <AddDomesticBuyerModal
          isOpen={isModalOpen}
          onClose={handleCancel}
          onSubmit={handleCreateBuyer}
        />
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
