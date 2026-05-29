import { z } from 'zod';

export const filterTaxInvoiceSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum([
      'createdAt',
      'invoiceDate',
      'invoiceNumber',
      'customerName',
      'grandTotal',
      'status',
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type FilterTaxInvoiceDto = z.infer<typeof filterTaxInvoiceSchema>;
