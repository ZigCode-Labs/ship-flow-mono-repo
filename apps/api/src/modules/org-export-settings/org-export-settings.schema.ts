import { z } from 'zod';

export const updateExportSettingsSchema = z.object({
  industryType: z.string().max(100).optional().nullable(),
  documentSet: z.string().max(50).optional().nullable(),
  defaultAdditionalDetails: z.string().optional().nullable(),
  defaultDescriptionOfGoods: z.string().optional().nullable(),
  defaultAdditionalInfo: z.string().optional().nullable(),
  defaultFreightBasis: z.string().optional().nullable(),
});

export const updateActiveDocumentsSchema = z.object({
  documents: z.array(
    z.object({
      documentName: z.string().max(100),
      isEnabled: z.boolean(),
      displayOrder: z.number().int().min(0).optional(),
    }),
  ),
});

export type UpdateExportSettingsDto = z.infer<typeof updateExportSettingsSchema>;
export type UpdateActiveDocumentsDto = z.infer<typeof updateActiveDocumentsSchema>;

export const CORE_DOCUMENTS = [
  { name: 'proforma_invoice', label: 'Proforma Invoice', isCore: true, defaultOrder: 0 },
  { name: 'commercial_invoice', label: 'Commercial Invoice', isCore: true, defaultOrder: 1 },
  { name: 'sample_invoice', label: 'Sample Invoice', isCore: true, defaultOrder: 2 },
  { name: 'packing_list', label: 'Packing List', isCore: true, defaultOrder: 3 },
] as const;

export const OPTIONAL_DOCUMENTS = [
  { name: 'bill_of_exchange', label: 'Bill of Exchange', isCore: false, defaultOrder: 4 },
  { name: 'bill_of_lading', label: 'Bill of Lading', isCore: false, defaultOrder: 5 },
  { name: 'shipping_instructions', label: 'Shipping Instructions', isCore: false, defaultOrder: 6 },
  { name: 'certificates', label: 'Certificates', isCore: false, defaultOrder: 7 },
  { name: 'other_documents', label: 'Other Documents', isCore: false, defaultOrder: 8 },
] as const;

export const ALL_DOCUMENTS = [...CORE_DOCUMENTS, ...OPTIONAL_DOCUMENTS];

export const INDUSTRY_TYPES = [
  { value: 'standard', label: '— Select your industry —' },
  { value: 'ceramic_tiles', label: 'Ceramic Tiles' },
  { value: 'textile', label: 'Textile & Garments' },
  { value: 'engineering', label: 'Engineering Goods' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'gems_jewelry', label: 'Gems & Jewelry' },
  { value: 'scrap_ferrous', label: 'Scrap & Ferrous Products' },
  { value: 'food_agriculture', label: 'Food & Agriculture' },
  { value: 'it_electronics', label: 'IT & Electronics' },
  { value: 'auto_parts', label: 'Automobile Parts' },
  { value: 'other', label: 'Other' },
];

export const DOCUMENT_SETS = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Default document set. Works for all general trading exporters.',
    documents: ['proforma_invoice', 'commercial_invoice', 'packing_list'],
  },
  {
    value: 'ceramic_tiles',
    label: 'Ceramic Tiles',
    description: 'Includes RCMC, movement, freight & insurance fields across all docs.',
    documents: ['proforma_invoice', 'commercial_invoice', 'packing_list', 'certificates'],
  },
  {
    value: 'scrap_ferrous',
    label: 'Scrap & Ferrous Products',
    description: 'For exporters of ferrous scrap, sponge iron, HMS and related bulk commodity.',
    documents: ['proforma_invoice', 'commercial_invoice', 'packing_list', 'bill_of_exchange'],
  },
];
