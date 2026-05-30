import { z } from 'zod';

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const iecRegex = /^[A-Z0-9]{10}$/;

export const createOrgSchema = z.object({
  name: z.string().min(2, 'Company name required').max(200),
  tradeName: z.string().max(200).optional(),
  country: z.string().default('India'),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  tradeName: z.string().max(200).optional(),
  iecCode: z
    .string()
    .regex(iecRegex, 'Invalid IEC code')
    .optional()
    .or(z.literal('')),
  gstNumber: z
    .string()
    .regex(gstinRegex, 'Invalid GSTIN')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN')
    .optional()
    .or(z.literal('')),
  cinNumber: z.string().max(21).optional(),
  registrationNumber: z.string().max(50).optional(),
  adCode: z.string().max(50).optional(),
  rcmcNumber: z.string().max(50).optional(),
  rcmcExpiry: z.string().datetime().optional().nullable(),
  dgftAuth: z.string().max(100).optional(),
  dgftExpiry: z.string().datetime().optional().nullable(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().min(10).max(15).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  bankName: z.string().min(2).optional().or(z.literal('')),
  bankAccountNo: z.string().min(9).max(18).optional().or(z.literal('')),
  bankIFSC: z
    .string()
    .regex(ifscRegex, 'Invalid IFSC')
    .optional()
    .or(z.literal('')),
  bankBranch: z.string().max(100).optional(),
  swiftCode: z.string().max(11).optional().or(z.literal('')),
  masterCurrency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'INR']).optional(),
  countryOfOrigin: z.string().max(100).optional(),
  portOfLoading: z.string().max(100).optional(),
  placeOfReceipt: z.string().max(100).optional(),
  itemCodePrefix: z
    .string()
    .max(10)
    .regex(/^[A-Z0-9\-_]*$/, 'Letters & numbers only')
    .optional()
    .or(z.literal('')),
  itemCodeDigits: z.number().int().min(3).max(8).optional(),
  fax: z.string().max(20).optional(),
  phone2: z.string().max(20).optional(),
  phone3: z.string().max(20).optional(),
  bankAddress: z.string().optional(),
  tanNumber: z.string().max(20).optional(),
  ircNo: z.string().max(50).optional(),
  portRegistrationNumber: z.string().max(50).optional(),
  sedexRegistrationNumber: z.string().max(50).optional(),
  complianceNotes: z.string().optional(),
  smtpEnabled: z.boolean().optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpFromEmail: z.string().email().optional().or(z.literal('')),
  smtpFromName: z.string().max(100).optional(),
  smtpUseTls: z.boolean().optional(),
  emailReplyTo: z.string().email().optional().or(z.literal('')),
  authorizedSignatoryName: z.string().max(150).optional(),
  authorizedSignatoryDesignation: z.string().max(150).optional(),
  defaultInvoiceTerms: z.string().optional(),
  defaultProformaTerms: z.string().optional(),
  onboardingDone: z.boolean().optional(),
});

export const orgIdSchema = z.string().uuid('Invalid org ID');
export const memberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

export type CreateOrgDto = z.infer<typeof createOrgSchema>;
export type UpdateOrgDto = z.infer<typeof updateOrgSchema>;
