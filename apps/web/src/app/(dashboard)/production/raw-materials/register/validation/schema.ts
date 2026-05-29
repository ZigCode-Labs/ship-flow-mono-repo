import { z } from 'zod';

const unitValues = ['pcs', 'kg', 'mtr', 'set', 'box', 'ltr', 'sqft'] as const;
const currencyValues = ['inr', 'usd', 'eur', 'gbp'] as const;

export const rawMaterialFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  category: z.string().trim().max(80).optional().or(z.literal('')),
  qtyOnHand: z.number().min(0, 'Quantity must be 0 or greater'),
  unit: z.enum(unitValues),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  currency: z.enum(currencyValues),
  standardRate: z.number().min(0, 'Standard rate must be 0 or greater'),
  preferredSupplier: z.string().trim().max(80).optional().or(z.literal('')),
  hsnCode: z.string().trim().max(20).optional().or(z.literal('')),
  gstRate: z.string().optional().or(z.literal('')),
  leadTime: z.number().min(0).optional(),
  minReorderLevel: z.number().min(0).optional(),
  storageLocation: z.string().trim().max(80).optional().or(z.literal('')),
  reorderQuantity: z.number().min(0).optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  attributes: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1, 'Attribute name is required'),
        value: z.string().trim().min(1, 'Attribute value is required'),
      }),
    )
    .optional(),
});

export type RawMaterialFormValues = z.infer<typeof rawMaterialFormSchema>;
