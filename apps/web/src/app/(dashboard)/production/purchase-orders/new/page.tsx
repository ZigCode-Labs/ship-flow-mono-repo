'use client';

import { useRouter } from 'next/navigation';
import { PurchaseOrderForm } from '../components/PurchaseOrderForm';
import type { PurchaseOrderFormValues } from '../types/form';

export default function NewPurchaseOrderPage() {
  const router = useRouter();

  const handleSave = (data: PurchaseOrderFormValues) => {
    // TODO: API call to save purchase order
    console.log('Saving Purchase Order:', data);

    // Navigate back to the list after save
    router.push('/production/purchase-orders');
  };

  const handleCancel = () => {
    router.push('/production/purchase-orders');
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto py-8 px-6 lg:px-8 pb-12">
        <PurchaseOrderForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
