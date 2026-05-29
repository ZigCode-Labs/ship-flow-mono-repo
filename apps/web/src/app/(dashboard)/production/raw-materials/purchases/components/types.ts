import { z } from 'zod';

export const rmLineItemSchema = z.object({
  id: z.string(),
  itemCode: z.string(),
  itemName: z.string(),
  hsn: z.string(),
  quantity: z.number(),
  unit: z.string(),
  rate: z.number(),
  discount: z.number(),
  gst: z.number(),
  amount: z.number(),
  total: z.number(),
  lineNote: z.string(),
});

export const rmPurchaseOrderFormSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  poContext: z.enum(['Domestic Purchase', 'Import Purchase']),
  issueDate: z.string().min(1, 'Issue date is required'),
  expectedDeliveryDate: z.string(),
  supplier: z.string(),
  supplierGstin: z.string(),
  supplierAddress: z.string(),
  deliveryLocation: z.string(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  paymentTerms: z.string(),
  shipToAddress: z.string(),
  notes: z.string(),
  internalNotes: z.string(),
  additionalCharges: z.number(),
  lineItems: z.array(rmLineItemSchema),
});

export type RMPurchaseOrderFormValues = z.infer<typeof rmPurchaseOrderFormSchema>;

export type RMLineItem = z.infer<typeof rmLineItemSchema>;

export interface RMPurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  issueDate: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent';
  lineItems: RMLineItem[];
}
