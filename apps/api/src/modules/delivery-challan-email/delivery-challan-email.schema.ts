import { z } from 'zod';

export const sendDeliveryChallanEmailSchema = z.object({
  challanId: z.string().min(1),
  recipientEmail: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  pdfBase64: z.string().optional(),
});

export type SendDeliveryChallanEmailDto = z.infer<
  typeof sendDeliveryChallanEmailSchema
>;
