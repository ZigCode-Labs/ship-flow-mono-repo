import { z } from 'zod';

export const domesticProformaItemSchema = z.object({
  id: z.string().optional(),
  itemCode: z.string().min(1, 'Item code is required'),
  description: z.string().min(1, 'Description is required'),
  hsn: z.string(),
  qty: z.number().min(1),
  rate: z.number().min(0),
  amount: z.number().min(0),
  gstPercent: z.number().min(0),
  total: z.number().min(0),
});

export const createDomesticProformaSchema = z.object({
  proformaNumber: z.string().min(1, 'Proforma number is required'),
  date: z.coerce.date(),
  validUntil: z.coerce.date(),
  exchangeRate: z.number().min(0),
  isRateLocked: z.boolean().default(false),

  sellerCompanyName: z.string().min(1, 'Seller company name is required'),
  sellerGstin: z.string().min(1, 'Seller GSTIN is required'),
  sellerState: z.string().min(1, 'Seller state is required'),

  customerName: z.string().min(1, 'Customer name is required'),
  customerGstin: z.string().min(1, 'Customer GSTIN is required'),
  placeOfSupply: z.string().min(1, 'Place of supply is required'),

  discountValue: z.number().min(0).default(0),
  discountType: z.enum(['₹', '%']).default('₹'),

  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  taxableAmount: z.number().min(0),
  igst: z.number().min(0).default(0),
  totalTax: z.number().min(0),
  grandTotal: z.number().min(0),

  paymentTerms: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  status: z.string().default('DRAFT'),

  lineItems: z.array(domesticProformaItemSchema).min(1, 'At least one line item is required'),
});

export const updateDomesticProformaSchema = createDomesticProformaSchema.partial();

export type CreateDomesticProformaDto = z.infer<typeof createDomesticProformaSchema>;
export type UpdateDomesticProformaDto = z.infer<typeof updateDomesticProformaSchema>;
