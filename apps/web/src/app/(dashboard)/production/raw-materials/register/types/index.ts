export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  qtyOnHand: number;
  unit: 'pcs' | 'kg' | 'mtr' | 'set' | 'box' | 'ltr' | 'sqft';
  currency: 'inr' | 'usd' | 'eur' | 'gbp';
  standardRate: number;
  preferredSupplier?: string;
  hsnCode?: string;
  gstRate?: number;
  leadTime?: number;
  minReorderLevel?: number;
  storageLocation?: string;
  reorderQuantity?: number;
  imageUrl?: string;
  attributes?: RawMaterialAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterialAttribute {
  id: string;
  name: string;
  value: string;
}

export type RawMaterialFormValues = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>;
