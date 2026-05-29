'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { RMRegisterForm } from '../components/RMRegisterForm';
import {
  appendRawMaterial,
  getNextItemCode,
  loadRawMaterials,
  setCreatedToastCode,
} from '../lib/storage';
import type { RawMaterial } from '../types';
import type { RawMaterialFormValues } from '../validation/schema';

export default function NewRawMaterialPage() {
  const router = useRouter();

  const itemCode = useMemo(() => {
    return getNextItemCode(loadRawMaterials());
  }, []);

  const handleSave = (data: RawMaterialFormValues) => {
    const timestamp = new Date().toISOString();
    const gstRate =
      data.gstRate && data.gstRate !== 'none' ? Number.parseFloat(data.gstRate) : undefined;

    const newItem: RawMaterial = {
      id: `raw-material-${timestamp}`,
      code: itemCode,
      name: data.name,
      category: data.category || undefined,
      qtyOnHand: data.qtyOnHand,
      unit: data.unit,
      description: data.description || undefined,
      currency: data.currency,
      standardRate: data.standardRate,
      preferredSupplier:
        data.preferredSupplier && data.preferredSupplier !== 'none'
          ? data.preferredSupplier
          : undefined,
      hsnCode: data.hsnCode || undefined,
      gstRate: Number.isFinite(gstRate) ? gstRate : undefined,
      leadTime: data.leadTime,
      minReorderLevel: data.minReorderLevel,
      storageLocation:
        data.storageLocation && data.storageLocation !== 'none' ? data.storageLocation : undefined,
      reorderQuantity: data.reorderQuantity,
      imageUrl: data.imageUrl || undefined,
      attributes: data.attributes,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    appendRawMaterial(newItem);
    setCreatedToastCode(itemCode);
    router.push('/production/raw-materials/register');
  };

  const handleCancel = () => {
    router.push('/production/raw-materials/register');
  };

  return <RMRegisterForm itemCode={itemCode} onBack={handleCancel} onSave={handleSave} />;
}
