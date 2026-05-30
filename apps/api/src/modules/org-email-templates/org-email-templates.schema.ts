import { z } from 'zod';

export const upsertEmailTemplateSchema = z.object({
  subjectTemplate: z.string().min(1).max(500),
  bodyTemplate: z.string().min(1),
  defaultCc: z.string().optional().nullable(),
  defaultBcc: z.string().optional().nullable(),
});

export type UpsertEmailTemplateDto = z.infer<typeof upsertEmailTemplateSchema>;

export const EXPORT_DOC_TYPES = [
  'commercial_invoice',
  'proforma_invoice',
  'packing_list',
  'bill_of_exchange',
  'bill_of_lading',
  'shipping_instructions',
  'certificates',
] as const;

export type ExportDocType = (typeof EXPORT_DOC_TYPES)[number];

export const DOC_TYPE_LABELS: Record<ExportDocType, string> = {
  commercial_invoice: 'Commercial Invoice',
  proforma_invoice: 'Proforma Invoice',
  packing_list: 'Packing List',
  bill_of_exchange: 'Bill of Exchange',
  bill_of_lading: 'Bill of Lading',
  shipping_instructions: 'Shipping Instructions',
  certificates: 'Certificates',
};

export const DEFAULT_TEMPLATES: Record<ExportDocType, { subject: string; body: string }> = {
  commercial_invoice: {
    subject: 'Commercial Invoice {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Commercial Invoice {{documentNumber}} for your reference.

Amount: {{currency}} {{amount}}
Date: {{date}}

If you have any questions, please feel free to contact us.

Best regards,
{{exporterName}}`,
  },
  proforma_invoice: {
    subject: 'Proforma Invoice {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Proforma Invoice {{documentNumber}} for your reference.

Amount: {{currency}} {{amount}}
Date: {{date}}

Kindly confirm your acceptance at the earliest.

Best regards,
{{exporterName}}`,
  },
  packing_list: {
    subject: 'Packing List {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Packing List {{documentNumber}} for shipment reference.

Date: {{date}}

Best regards,
{{exporterName}}`,
  },
  bill_of_exchange: {
    subject: 'Bill of Exchange {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Bill of Exchange {{documentNumber}} for your acceptance.

Amount: {{currency}} {{amount}}
Date: {{date}}

Best regards,
{{exporterName}}`,
  },
  bill_of_lading: {
    subject: 'Bill of Lading {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Bill of Lading {{documentNumber}} for your records.

Date: {{date}}

Best regards,
{{exporterName}}`,
  },
  shipping_instructions: {
    subject: 'Shipping Instructions {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Shipping Instructions {{documentNumber}} for your reference.

Date: {{date}}

Best regards,
{{exporterName}}`,
  },
  certificates: {
    subject: 'Certificate {{documentNumber}} from {{exporterName}}',
    body: `Dear {{buyerName}},

Please find attached Certificate {{documentNumber}} for your reference.

Date: {{date}}

Best regards,
{{exporterName}}`,
  },
};
