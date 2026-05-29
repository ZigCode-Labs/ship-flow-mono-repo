import { z } from 'zod';

const emptyToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const optionalString = (max?: number) => {
  const schema = z.preprocess(emptyToNull, z.string().trim().nullable().optional());
  return max
    ? schema.refine((value) => !value || value.length <= max, `Maximum ${max} characters`)
    : schema;
};

const requiredString = (field: string, max?: number) => {
  let schema = z.string().trim().min(1, `${field} is required`);
  if (max) schema = schema.max(max, `Maximum ${max} characters`);
  return schema;
};

const requiredUppercaseString = (field: string, max?: number) =>
  requiredString(field, max).transform((value) => value.toUpperCase());

const optionalUppercaseString = (max?: number) =>
  optionalString(max).transform((value) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );

export const domesticBuyerIdSchema = z.string().uuid('ID must be a valid UUID');
export const domesticBuyerStatusSchema = z.enum(['active', 'inactive', 'trash']);

export const createDomesticBuyerSchema = z.object({
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
    (value) => !value || z.string().email().safeParse(value).success,
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
  status: domesticBuyerStatusSchema.default('active'),
});

export const updateDomesticBuyerSchema = createDomesticBuyerSchema.partial();

export type CreateDomesticBuyerDto = z.infer<typeof createDomesticBuyerSchema>;
export type UpdateDomesticBuyerDto = z.infer<typeof updateDomesticBuyerSchema>;
