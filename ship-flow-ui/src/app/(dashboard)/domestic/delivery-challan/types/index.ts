export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  customerName: string;
  challanDate: string;
  deliveryDate: string;
  status: 'draft' | 'sent' | 'delivered' | 'cancelled';
  deliveryType?: string;
  companyName: string;
  gstin: string;
  state: string;
  customerId: string;
  customerGstin: string;
  buyerAddress: string;
  placeOfSupply: string;
  reference: string;
  notes: string;
  exchangeRate: number;
  lineItems: Array<{
    id: string;
    itemCode: string;
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    gst: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  totalTax: number;
  grandTotal: number;
}

export interface DeliveryChallanLineItem {
  id: string;
  itemCode: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  gst: number;
  total: number;
}

// Form Configuration Types
export interface DeliveryChallanFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'toggle' | 'textarea';
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: string | number | boolean;
  defaultToday?: boolean;
  autoGenerate?: boolean;
  autoFillFrom?: string;
  sourceFrom?: string;
  dataSource?: string;
  suffix?: string;
  fullWidth?: boolean;
  computed?: boolean;
  highlight?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface DeliveryChallanFormColumn {
  id: string;
  label: string;
  type?: string;
  dataSource?: string;
  computed?: boolean;
}

export interface DeliveryChallanFormAction {
  id: string;
  label: string;
  icon: string;
  type: string;
  apiSource?: string;
}

export interface DeliveryChallanFormSection {
  id: string;
  title: string;
  icon?: string;
  layout: 'grid-1' | 'grid-2' | 'grid-3' | 'grid-4' | 'inline' | 'table' | 'totals';
  fields: DeliveryChallanFormField[];
  columns?: DeliveryChallanFormColumn[];
  actions?: DeliveryChallanFormAction[];
  note?: string;
  emptyState?: string;
}

export interface DeliveryChallanDataSourceOption {
  value: string;
  label: string;
  name?: string;
  gstin?: string;
  address?: string;
  state?: string;
  placeOfDelivery?: string;
}

export interface DeliveryChallanFormDataSources {
  domesticBuyers: DeliveryChallanDataSourceOption[];
  indianStates: DeliveryChallanDataSourceOption[];
  gstRates: DeliveryChallanDataSourceOption[];
  deliveryTypes?: DeliveryChallanDataSourceOption[];
  invoices?: DeliveryChallanDataSourceOption[];
  units?: DeliveryChallanDataSourceOption[];
}

export interface DeliveryChallanSellerProfile {
  companyName: string;
  gstin: string;
  state: string;
}

export interface DeliveryChallanFormConfig {
  sections: DeliveryChallanFormSection[];
  dataSources: DeliveryChallanFormDataSources;
  sellerProfile: DeliveryChallanSellerProfile;
}
