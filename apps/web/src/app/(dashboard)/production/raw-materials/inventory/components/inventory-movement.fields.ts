export const movementTypeOptions = [
  {
    label: 'Opening Stock',
    value: 'opening_stock',
  },
  {
    label: 'Stock In',
    value: 'stock_in',
  },
  {
    label: 'Stock Out',
    value: 'stock_out',
  },
  {
    label: 'Adjustment',
    value: 'adjustment',
  },
] as const;

export const inventoryMovementFields = [
  {
    name: 'rawMaterialItem',
    label: 'Raw Material Item',
    type: 'select',
    placeholder: 'Select item...',
    emptyMessage: 'No raw material items found',
  },

  {
    name: 'movementType',
    label: 'Movement Type',
    type: 'select',
    options: movementTypeOptions,
  },

  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    placeholder: '0.000',
  },

  {
    name: 'batchNo',
    label: 'Batch #',
    type: 'text',
    placeholder: 'e.g. B-2024-01',
    optional: true,
  },

  {
    name: 'lotNo',
    label: 'Lot #',
    type: 'text',
    placeholder: 'e.g. L-001',
    optional: true,
  },

  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any notes about this movement...',
    optional: true,
  },
] as const;
