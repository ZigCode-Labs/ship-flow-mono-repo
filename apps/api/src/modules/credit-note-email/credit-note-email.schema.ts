import { z } from 'zod';

const recipientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  type: z.string(),
});

const lineItemSchema = z.object({
  id: z.string().optional(),
  itemCode: z.string().optional().default(''),
  description: z.string(),
  hsn: z.string().optional().default(''),
  quantity: z.number(),
  rate: z.number(),
  amount: z.number(),
  gst: z.number(),
  total: z.number(),
});

export const creditNoteDataSchema = z.object({
  creditNoteNumber: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  creditNoteDate: z.string(),
  customerName: z.string(),
  customerGstin: z.string().optional().default(''),
  placeOfSupply: z.string().optional().default(''),
  reason: z.string().optional().default(''),
  subtotal: z.number(),
  discount: z.number(),
  taxableAmount: z.number(),
  totalTax: z.number(),
  grandTotal: z.number(),
  lineItems: z.array(lineItemSchema),
});

export const sendCreditNoteEmailSchema = z.object({
  creditNote: creditNoteDataSchema,
  recipients: z.array(recipientSchema).min(1),
  cc: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().optional(),
  attachPdf: z.boolean(),
  pdfFileName: z.string(),
});

export type SendCreditNoteEmailDto = z.infer<typeof sendCreditNoteEmailSchema>;
export type CreditNoteData = z.infer<typeof creditNoteDataSchema>;
