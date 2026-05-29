import { z } from 'zod';

// Line Item Schema
export const lineItemSchema = z.object({
  id: z.string(),
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  hsn: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  gst: z.number().default(0),
  amount: z.number(),
  total: z.number(),
});

// PO Form Schema
export const purchaseOrderFormSchema = z.object({
  poNumber: z.string().min(1, 'PO Number is required'),
  poContext: z.enum(['Domestic Purchase', 'Import Purchase']),
  issueDate: z.string().min(1, 'Issue date is required'),
  expectedDeliveryDate: z.string(),
  supplier: z.string().min(1, 'Supplier is required'),
  supplierGstin: z.string(),
  supplierAddress: z.string(),
  deliveryLocation: z.string(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  paymentTerms: z.string(),
  shipToAddress: z.string(),
  notes: z.string(),
  internalNotes: z.string(),
  additionalCharges: z.number(),
  lineItems: z.array(lineItemSchema),
});

export type LineItem = z.infer<typeof lineItemSchema>;
export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;

// Form Config Types
export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: Array<{ value: string; label: string }>;
  span?: 1 | 2;
  defaultValue?: string | number;
  defaultToday?: boolean;
  autoGenerate?: boolean;
}

export interface FormSectionConfig {
  id: string;
  title: string;
  icon?: string;
  fields: FormFieldConfig[];
}

export interface PurchaseOrderFormConfig {
  sections: FormSectionConfig[];
  dataSources: {
    suppliers: Array<{ value: string; label: string; gstin?: string; address?: string }>;
    deliveryLocations: Array<{ value: string; label: string }>;
    currencies: Array<{ value: string; label: string }>;
    poContexts: Array<{ value: string; label: string }>;
    gstRates: Array<{ value: string; label: string }>;
    units: Array<{ value: string; label: string }>;
  };
}

// Computed values type
export interface ComputedValues {
  subtotal: number;
  igst: number;
  totalTax: number;
  additionalCharges: number;
  grandTotal: number;
}
