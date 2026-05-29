'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.updateDomesticBuyerSchema =
  exports.createDomesticBuyerSchema =
  exports.domesticBuyerStatusSchema =
  exports.domesticBuyerIdSchema =
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
const requiredUppercaseString = (field, max) =>
  requiredString(field, max).transform((value) => value.toUpperCase());
const optionalUppercaseString = (max) =>
  optionalString(max).transform((value) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );
exports.domesticBuyerIdSchema = zod_1.z.string().uuid('ID must be a valid UUID');
exports.domesticBuyerStatusSchema = zod_1.z.enum(['active', 'inactive', 'trash']);
exports.createDomesticBuyerSchema = zod_1.z.object({
  companyName: requiredString('Company name', 255),
  tradeName: optionalString(255),
  gstin: requiredUppercaseString('GSTIN', 15).refine(
    (value) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value),
    'GSTIN must be a valid 15 character GST number',
  ),
  panNumber: optionalUppercaseString(10).refine(
    (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value),
    'PAN number must be valid',
  ),
  address: optionalString(),
  city: optionalString(100),
  state: requiredString('State', 100),
  pincode: optionalString(10).refine(
    (value) => !value || /^[1-9][0-9]{5}$/.test(value),
    'Pincode must be a valid 6 digit code',
  ),
  contactPerson: optionalString(150),
  designation: optionalString(150),
  email: optionalString(255).refine(
    (value) => !value || zod_1.z.string().email().safeParse(value).success,
    'Email must be valid',
  ),
  phone: optionalString(30),
  alternatePhone: optionalString(30),
  bankName: optionalString(150),
  accountNumber: optionalString(50),
  ifscCode: optionalUppercaseString(11).refine(
    (value) => !value || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value),
    'IFSC code must be valid',
  ),
  branch: optionalString(150),
  notes: optionalString(),
  status: exports.domesticBuyerStatusSchema.default('active'),
});
exports.updateDomesticBuyerSchema = exports.createDomesticBuyerSchema.partial();
//# sourceMappingURL=domestic-buyer.js.map
