export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  companyName: string;
  gstin: string;
  state: string;
  customerId: string;
  customerGstin: string;
  placeOfSupply: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  paymentTerms: string;
  reference: string;
  notes: string;
  exchangeRate: number;
  lineItems: Array<{
    id: string;
    itemCode: string;
    description: string;
    hsn: string;
    quantity: number;
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

export interface LineItem {
  id: string;
  itemCode: string;
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
  amount: number;
  gst: number;
  total: number;
}

// Form Configuration Types
export interface FormField {
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

export interface FormColumn {
  id: string;
  label: string;
  type?: string;
  dataSource?: string;
  computed?: boolean;
}

export interface FormAction {
  id: string;
  label: string;
  icon: string;
  type: string;
  apiSource?: string;
}

export interface FormSection {
  id: string;
  title: string;
  icon?: string;
  layout: 'grid-1' | 'grid-2' | 'grid-3' | 'grid-4' | 'inline' | 'table' | 'totals';
  fields: FormField[];
  columns?: FormColumn[];
  actions?: FormAction[];
  note?: string;
  emptyState?: string;
}

export interface DataSourceOption {
  value: string;
  label: string;
  name?: string;
  gstin?: string;
}

export interface FormDataSources {
  domesticBuyers: DataSourceOption[];
  indianStates: DataSourceOption[];
  gstRates: DataSourceOption[];
}

export interface SellerProfile {
  companyName: string;
  gstin: string;
  state: string;
}

export interface TaxInvoiceFormConfig {
  sections: FormSection[];
  dataSources: FormDataSources;
  sellerProfile: SellerProfile;
}
