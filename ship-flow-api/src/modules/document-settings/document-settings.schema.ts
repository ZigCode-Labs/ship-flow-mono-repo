import { z } from 'zod';

export const documentSettingsSchema = z.object({
  prefix: z
    .string()
    .min(1, 'prefix is requires')
    .max(10, 'prefix is to long')
    .regex(/^[A-Z]+$/, 'Letters and number only, no spaces'),
  digits: z
    .number()
    .int('Must be a whole number')
    .min(2, 'Minimum 2 digits')
    .max(6, 'Maximum 6 digits'),
  startingNumber: z.number().int('Must be a whole number').min(1, 'Minimum 1'),
});
export const upsertSettingSchema = z.object({
  documentType: z.enum([
    'TAX_INVOICE',
    'DOMESTIC_PROFORMA',
    'CREDIT_NOTE',
    'DELIVERY_CHALLAN',
  ]),
  prefix: documentSettingsSchema.shape.prefix,
  digits: documentSettingsSchema.shape.digits,
  startingNumber: documentSettingsSchema.shape.startingNumber,
});

export type UpsertSettingDto = z.infer<typeof upsertSettingSchema>;
