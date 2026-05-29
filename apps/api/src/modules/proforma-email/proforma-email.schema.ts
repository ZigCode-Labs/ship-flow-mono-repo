import { z } from 'zod';

export const recipientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  type: z.string(),
});

export const sendProformaEmailSchema = z.object({
  proformaId: z.string().min(1),
  proformaNumber: z.string(),
  recipients: z.array(recipientSchema).min(1),
  cc: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().optional(),
  attachPdf: z.boolean(),
  pdfFileName: z.string(),
});

export type SendProformaEmailDto = z.infer<typeof sendProformaEmailSchema>;

export const createBusinessEmailContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBusinessEmailContactDto = z.infer<
  typeof createBusinessEmailContactSchema
>;

export const searchContactsQuerySchema = z.object({
  search: z.string().optional(),
});

export type SearchContactsQueryDto = z.infer<typeof searchContactsQuerySchema>;
