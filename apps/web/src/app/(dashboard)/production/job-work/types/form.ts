import { z } from 'zod';

export const jobWorkFormSchema = z.object({
  jobWorkNumber: z.string(),
  jobWorkType: z.string(),
  issueDate: z.string(),
  expectedReturnDate: z.string(),
  jobWorker: z.string(),
  jobWorkerAddress: z.string().optional(),
  issueTime: z.string().optional(),
  remarks: z.string().optional(),
  overallDiscount: z.number().default(0),
  issueLines: z.array(
    z.object({
      id: z.string(),
      itemCode: z.string(),
      itemName: z.string(),
      workOperation: z.string(),
      quantity: z.number(),
      unit: z.string(),
      rate: z.number(),
      discount: z.number(),
      amount: z.number(),
      total: z.number(),
      remarks: z.string().optional(),
    }),
  ),
});

export type JobWorkFormValues = z.infer<typeof jobWorkFormSchema>;

export interface IssueLine {
  id: string;
  itemCode: string;
  itemName: string;
  workOperation: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  amount: number;
  total: number;
  remarks?: string;
}

export interface ComputedValues {
  subtotal: number;
  overallDiscount: number;
  totalJobWorkValue: number;
}

export interface JobWorkFormConfig {
  dataSources: {
    jobWorkTypes: Array<{ value: string; label: string }>;
    jobWorkers: Array<{ value: string; label: string; address?: string }>;
    issueItems: Array<{ value: string; label: string }>;
    workOperations: Array<{ value: string; label: string }>;
  };
}
