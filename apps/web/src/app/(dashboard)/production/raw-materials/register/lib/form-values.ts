import type { RawMaterial } from '../types';
import type { RawMaterialFormValues } from '../validation/schema';

export function materialToFormValues(material: RawMaterial): RawMaterialFormValues {
  return {
    name: material.name,
    category: material.category ?? '',
    qtyOnHand: material.qtyOnHand,
    unit: material.unit,
    description: material.description ?? '',
    currency: material.currency,
    standardRate: material.standardRate,
    preferredSupplier: material.preferredSupplier ?? 'none',
    hsnCode: material.hsnCode ?? '',
    gstRate:
      material.gstRate !== undefined && material.gstRate !== null
        ? String(material.gstRate)
        : 'none',
    leadTime: material.leadTime,
    minReorderLevel: material.minReorderLevel ?? 0,
    storageLocation: material.storageLocation ?? 'none',
    reorderQuantity: material.reorderQuantity ?? 0,
    imageUrl: material.imageUrl ?? '',
    attributes: material.attributes ?? [],
  };
}
