'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.filterTaxInvoiceSchema =
  exports.updateTaxInvoiceLineItemSchema =
  exports.updateTaxInvoiceSchema =
  exports.createTaxInvoiceSchema =
  exports.taxInvoiceLineItemSchema =
    void 0;
const zod_1 = require('zod');
const emptyToNull = (value) => (typeof value === 'string' && value.trim() === '' ? null : value);
const optionalString = (max) => {
  const schema = zod_1.z.preprocess(emptyToNull, zod_1.z.string().trim().nullable().optional());
  return max
    ? schema.refine((value) => !value || value.length <= max, `Maximum ${max} characters`)
    : schema;
};
const requiredString = (field, max) => {
  let schema = zod_1.z.string().trim().min(1, `${field} is required`);
  if (max) schema = schema.max(max, `Maximum ${max} characters`);
  return schema;
};
exports.taxInvoiceLineItemSchema = zod_1.z.object({
  itemCode: requiredString('Item code', 100),
  description: requiredString('Description'),
  hsn: zod_1.z.string().trim().default(''),
  quantity: zod_1.z.number().min(1, 'Quantity must be at least 1'),
  rate: zod_1.z.number().min(0, 'Rate must be 0 or more'),
  amount: zod_1.z.number().min(0),
  gst: zod_1.z.number().min(0, 'GST must be 0 or more'),
  total: zod_1.z.number().min(0),
});
exports.createTaxInvoiceSchema = zod_1.z.object({
  invoiceNumber: zod_1.z.string().optional(),
  invoiceDate: zod_1.z.coerce.date(),
  dueDate: zod_1.z.coerce.date().optional().nullable(),
  exchangeRate: zod_1.z.number().min(0).default(93.06),
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
  notes: zod_1.z.preprocess(emptyToNull, zod_1.z.string().nullable().optional()),
  subtotal: zod_1.z.number().min(0),
  discount: zod_1.z.number().min(0).default(0),
  taxableAmount: zod_1.z.number().min(0),
  igst: zod_1.z.number().min(0).default(0),
  totalTax: zod_1.z.number().min(0),
  grandTotal: zod_1.z.number().min(0),
  status: zod_1.z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  lineItems: zod_1.z
    .array(exports.taxInvoiceLineItemSchema)
    .min(1, 'At least one line item is required'),
});
exports.updateTaxInvoiceSchema = exports.createTaxInvoiceSchema.partial();
exports.updateTaxInvoiceLineItemSchema = exports.taxInvoiceLineItemSchema.partial();
exports.filterTaxInvoiceSchema = zod_1.z.object({
  search: zod_1.z.string().optional(),
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
  sortBy: zod_1.z
    .enum(['createdAt', 'invoiceDate', 'invoiceNumber', 'customerName', 'grandTotal', 'status'])
    .default('createdAt'),
  sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
  status: zod_1.z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  dateFrom: zod_1.z.coerce.date().optional(),
  dateTo: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=tax-invoice.js.map
