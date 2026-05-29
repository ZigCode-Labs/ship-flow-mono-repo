'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { RMRegisterForm } from '../../components/RMRegisterForm';
import { findRawMaterialById, setUpdatedToastCode, updateRawMaterial } from '../../lib/storage';
import type { RawMaterial } from '../../types';
import type { RawMaterialFormValues } from '../../validation/schema';

export default function EditRawMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;

  const material = useMemo(() => findRawMaterialById(materialId), [materialId]);

  useEffect(() => {
    if (!material) {
      router.replace('/production/raw-materials/register');
    }
  }, [material, router]);

  const handleSave = (data: RawMaterialFormValues) => {
    if (!material) return;

    const gstRate =
      data.gstRate && data.gstRate !== 'none' ? Number.parseFloat(data.gstRate) : undefined;

    const updatedItem: RawMaterial = {
      ...material,
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
      updatedAt: new Date().toISOString(),
    };

    updateRawMaterial(updatedItem);
    setUpdatedToastCode(material.code);
    router.push('/production/raw-materials/register');
  };

  const handleCancel = () => {
    router.push('/production/raw-materials/register');
  };

  if (!material) {
    return null;
  }

  return (
    <RMRegisterForm
      key={material.id}
      itemCode={material.code}
      initialMaterial={material}
      onBack={handleCancel}
      onSave={handleSave}
    />
  );
}
