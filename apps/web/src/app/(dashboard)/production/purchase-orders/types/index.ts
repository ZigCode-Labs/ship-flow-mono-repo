export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  currency: string;
  items: PurchaseOrderItem[];
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
}

export type PurchaseOrderStatus = PurchaseOrder['status'];

export const statusLabels: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  confirmed: 'Confirmed',
  received: 'Received',
  cancelled: 'Cancelled',
};

export const statusColors: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  received: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

// Re-export form types
export * from './form';
