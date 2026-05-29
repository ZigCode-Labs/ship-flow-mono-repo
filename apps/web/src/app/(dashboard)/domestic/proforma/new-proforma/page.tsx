'use client';

import { useRouter } from 'next/navigation';
import { ProformaForm } from '@/components/proforma';

export default function NewProformaPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/domestic/proforma');
  };

  return <ProformaForm onCancel={handleCancel} />;
}
