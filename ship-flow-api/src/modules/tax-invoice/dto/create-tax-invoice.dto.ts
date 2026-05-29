import { z } from 'zod';

const emptyToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const optionalString = (max?: number) => {
  const schema = z.preprocess(
    emptyToNull,
    z.string().trim().nullable().optional(),
  );
  return max
    ? schema.refine(
        (value) => !value || value.length <= max,
        `Maximum ${max} characters`,
      )
    : schema;
};

const requiredString = (field: string, max?: number) => {
  let schema = z.string().trim().min(1, `${field} is required`);
  if (max) {
    schema = schema.max(max, `Maximum ${max} characters`);
  }
  return schema;
};

export const taxInvoiceLineItemSchema = z.object({
  itemCode: requiredString('Item code', 100),
  description: requiredString('Description'),
  hsn: z.string().trim().default(''),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be 0 or more'),
  amount: z.number().min(0),
  gst: z.number().min(0, 'GST must be 0 or more'),
  total: z.number().min(0),
});

export const createTaxInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),

  exchangeRate: z.number().min(0).default(93.06),

  companyName: requiredString('Company name', 255),
  gstin: requiredString('GSTIN', 50),
  state: requiredString('State', 100),

  customerId: requiredString('Customer ID', 255),
  customerName: requiredString('Customer name', 255),
  customerGstin: requiredString('Customer GSTIN', 50),
  placeOfSupply: requiredString('Place of supply', 100),

  bankName: optionalString(150),
  accountNumber: optionalString(50),
  ifscCode: optionalString(11),
  branch: optionalString(150),

  paymentTerms: optionalString(255),
  reference: optionalString(255),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),

  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  taxableAmount: z.number().min(0),
  igst: z.number().min(0).default(0),
  totalTax: z.number().min(0),
  grandTotal: z.number().min(0),

  status: z
    .enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .default('draft'),

  lineItems: z
    .array(taxInvoiceLineItemSchema)
    .min(1, 'At least one line item is required'),
});

export type CreateTaxInvoiceDto = z.infer<typeof createTaxInvoiceSchema>;
