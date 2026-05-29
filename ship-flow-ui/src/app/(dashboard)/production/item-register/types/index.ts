export interface ProductionItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'finished_goods' | 'raw_material' | 'component' | 'sub_assembly';
  unit: 'pcs' | 'kg' | 'mtr' | 'set' | 'box';
  category?: string;
  productionSource?: 'in_house' | 'outsourced';
  manufacturer?: string;
  quantity?: number;
  currency?: 'inr' | 'usd' | 'eur' | 'gbp';
  itemPrice?: string;
  isManualPrice?: boolean;
  productionNotes?: string;
  imageUrl?: string;
  components?: ProductionItemComponent[];
  specFiles?: ProductionItemSpecFile[];
  attributes?: ProductionItemAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionItemComponent {
  id: string;
  name: string;
  quantity: number;
  shape: 'box' | 'cylinder' | 'sphere' | 'custom';
  length?: string;
  breadth?: string;
  height?: string;
  material?: string;
  finish?: string;
  costPerUnit?: string;
  isFragile: boolean;
  assemblyRequired: boolean;
  notes?: string;
  customAttribute?: string;
}

export interface ProductionItemSpecFile {
  id: string;
  name: string;
  fileName: string;
}

export interface ProductionItemAttribute {
  id: string;
  name: string;
  value: string;
}

export type ItemType = 'all' | 'finished_goods' | 'raw_material' | 'component' | 'sub_assembly';

export interface ItemTypeOption {
  value: ItemType;
  label: string;
}

export const itemTypeOptions: ItemTypeOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'finished_goods', label: 'Finished Goods' },
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'component', label: 'Component' },
  { value: 'sub_assembly', label: 'Sub Assembly' },
];

export const itemTypeLabels: Record<string, string> = {
  finished_goods: 'Finished Goods',
  raw_material: 'Raw Material',
  component: 'Component',
  sub_assembly: 'Sub Assembly',
};
