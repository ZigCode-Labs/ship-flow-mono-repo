import { z } from 'zod';

export const deliveryChallanItemSchema = z.object({
  id: z.string().optional(),
  itemCode: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required'),
  hsn: z.string().optional().default(''),
  quantity: z.number().min(0),
  unit: z.string().default('PCS'),
  rate: z.number().min(0),
  amount: z.number().min(0),
  gst: z.number().min(0).default(0),
  total: z.number().min(0),
});

export const createDeliveryChallanSchema = z.object({
  challanNumber: z.string().min(1, 'Challan number is required'),
  challanDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional().nullable(),
  deliveryType: z.string().default('supply_of_goods'),

  companyName: z.string().min(1, 'Company name is required'),
  gstin: z.string().optional().default(''),
  state: z.string().optional().default(''),

  customerId: z.string().optional().default(''),
  customerName: z.string().min(1, 'Customer name is required'),
  customerGstin: z.string().optional().default(''),
  buyerAddress: z.string().optional().default(''),
  buyerState: z.string().optional().default(''),
  placeOfSupply: z.string().min(1, 'Place of delivery is required'),

  transporterName: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  expectedDeliveryDate: z.coerce.date().optional().nullable(),

  linkedInvoiceId: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  exchangeRate: z.number().min(0).default(1),

  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  taxableAmount: z.number().min(0),
  totalTax: z.number().min(0).default(0),
  grandTotal: z.number().min(0),

  status: z.string().default('draft'),

  lineItems: z.array(deliveryChallanItemSchema).min(1, 'At least one line item is required'),
});

export const updateDeliveryChallanSchema = createDeliveryChallanSchema.partial();

export type CreateDeliveryChallanDto = z.infer<typeof createDeliveryChallanSchema>;
export type UpdateDeliveryChallanDto = z.infer<typeof updateDeliveryChallanSchema>;
