import { z } from 'zod';

export const inventoryMovementSchema = z.object({
  rawMaterialItem: z.string().min(1, 'Raw material item is required'),

  movementType: z.enum(['opening_stock', 'stock_in', 'stock_out', 'adjustment']),

  quantity: z.string().min(1, 'Quantity is required'),

  batchNo: z.string().optional(),

  lotNo: z.string().optional(),

  notes: z.string().optional(),
});

export type InventoryMovementFormValues = z.infer<typeof inventoryMovementSchema>;
