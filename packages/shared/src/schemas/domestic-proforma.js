'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.updateDomesticProformaSchema =
  exports.createDomesticProformaSchema =
  exports.domesticProformaItemSchema =
    void 0;
const zod_1 = require('zod');
exports.domesticProformaItemSchema = zod_1.z.object({
  id: zod_1.z.string().optional(),
  itemCode: zod_1.z.string().min(1, 'Item code is required'),
  description: zod_1.z.string().min(1, 'Description is required'),
  hsn: zod_1.z.string(),
  qty: zod_1.z.number().min(1),
  rate: zod_1.z.number().min(0),
  amount: zod_1.z.number().min(0),
  gstPercent: zod_1.z.number().min(0),
  total: zod_1.z.number().min(0),
});
exports.createDomesticProformaSchema = zod_1.z.object({
  proformaNumber: zod_1.z.string().min(1, 'Proforma number is required'),
  date: zod_1.z.coerce.date(),
  validUntil: zod_1.z.coerce.date(),
  exchangeRate: zod_1.z.number().min(0),
  isRateLocked: zod_1.z.boolean().default(false),
  sellerCompanyName: zod_1.z.string().min(1, 'Seller company name is required'),
  sellerGstin: zod_1.z.string().min(1, 'Seller GSTIN is required'),
  sellerState: zod_1.z.string().min(1, 'Seller state is required'),
  customerName: zod_1.z.string().min(1, 'Customer name is required'),
  customerGstin: zod_1.z.string().min(1, 'Customer GSTIN is required'),
  placeOfSupply: zod_1.z.string().min(1, 'Place of supply is required'),
  discountValue: zod_1.z.number().min(0).default(0),
  discountType: zod_1.z.enum(['₹', '%']).default('₹'),
  subtotal: zod_1.z.number().min(0),
  discountAmount: zod_1.z.number().min(0).default(0),
  taxableAmount: zod_1.z.number().min(0),
  igst: zod_1.z.number().min(0).default(0),
  totalTax: zod_1.z.number().min(0),
  grandTotal: zod_1.z.number().min(0),
  paymentTerms: zod_1.z.string().optional().nullable(),
  reference: zod_1.z.string().optional().nullable(),
  notes: zod_1.z.string().optional().nullable(),
  status: zod_1.z.string().default('DRAFT'),
  lineItems: zod_1.z
    .array(exports.domesticProformaItemSchema)
    .min(1, 'At least one line item is required'),
});
exports.updateDomesticProformaSchema = exports.createDomesticProformaSchema.partial();
//# sourceMappingURL=domestic-proforma.js.map
