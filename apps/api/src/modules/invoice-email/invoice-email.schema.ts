import { z } from 'zod';

const recipientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  type: z.string(),
});

export const sendInvoiceEmailSchema = z.object({
  invoiceId: z.string().min(1),
  invoiceNumber: z.string(),
  recipients: z.array(recipientSchema).min(1),
  cc: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().optional(),
  attachPdf: z.boolean(),
  pdfFileName: z.string(),
});

export type SendInvoiceEmailDto = z.infer<typeof sendInvoiceEmailSchema>;
