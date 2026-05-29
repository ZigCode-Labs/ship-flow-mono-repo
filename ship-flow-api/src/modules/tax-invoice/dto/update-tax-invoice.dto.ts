import { z } from 'zod';
import {
  createTaxInvoiceSchema,
  taxInvoiceLineItemSchema,
} from './create-tax-invoice.dto';

export const updateTaxInvoiceSchema = createTaxInvoiceSchema.partial();

export const updateTaxInvoiceLineItemSchema =
  taxInvoiceLineItemSchema.partial();

export type UpdateTaxInvoiceDto = z.infer<typeof updateTaxInvoiceSchema>;
