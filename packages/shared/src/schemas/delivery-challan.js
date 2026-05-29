'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.updateDeliveryChallanSchema =
  exports.createDeliveryChallanSchema =
  exports.deliveryChallanItemSchema =
    void 0;
const zod_1 = require('zod');
exports.deliveryChallanItemSchema = zod_1.z.object({
  id: zod_1.z.string().optional(),
  itemCode: zod_1.z.string().optional().default(''),
  description: zod_1.z.string().min(1, 'Description is required'),
  hsn: zod_1.z.string().optional().default(''),
  quantity: zod_1.z.number().min(0),
  unit: zod_1.z.string().default('PCS'),
  rate: zod_1.z.number().min(0),
  amount: zod_1.z.number().min(0),
  gst: zod_1.z.number().min(0).default(0),
  total: zod_1.z.number().min(0),
});
exports.createDeliveryChallanSchema = zod_1.z.object({
  challanNumber: zod_1.z.string().min(1, 'Challan number is required'),
  challanDate: zod_1.z.coerce.date(),
  deliveryDate: zod_1.z.coerce.date().optional().nullable(),
  deliveryType: zod_1.z.string().default('supply_of_goods'),
  companyName: zod_1.z.string().min(1, 'Company name is required'),
  gstin: zod_1.z.string().optional().default(''),
  state: zod_1.z.string().optional().default(''),
  customerId: zod_1.z.string().optional().default(''),
  customerName: zod_1.z.string().min(1, 'Customer name is required'),
  customerGstin: zod_1.z.string().optional().default(''),
  buyerAddress: zod_1.z.string().optional().default(''),
  buyerState: zod_1.z.string().optional().default(''),
  placeOfSupply: zod_1.z.string().min(1, 'Place of delivery is required'),
  transporterName: zod_1.z.string().optional().nullable(),
  vehicleNumber: zod_1.z.string().optional().nullable(),
  expectedDeliveryDate: zod_1.z.coerce.date().optional().nullable(),
  linkedInvoiceId: zod_1.z.string().optional().nullable(),
  reference: zod_1.z.string().optional().nullable(),
  notes: zod_1.z.string().optional().nullable(),
  exchangeRate: zod_1.z.number().min(0).default(1),
  subtotal: zod_1.z.number().min(0),
  discount: zod_1.z.number().min(0).default(0),
  taxableAmount: zod_1.z.number().min(0),
  totalTax: zod_1.z.number().min(0).default(0),
  grandTotal: zod_1.z.number().min(0),
  status: zod_1.z.string().default('draft'),
  lineItems: zod_1.z
    .array(exports.deliveryChallanItemSchema)
    .min(1, 'At least one line item is required'),
});
exports.updateDeliveryChallanSchema = exports.createDeliveryChallanSchema.partial();
//# sourceMappingURL=delivery-challan.js.map
