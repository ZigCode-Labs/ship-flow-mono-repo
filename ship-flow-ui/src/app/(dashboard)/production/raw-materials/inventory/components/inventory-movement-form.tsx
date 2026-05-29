'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, Check } from 'lucide-react';

import { inventoryMovementSchema, InventoryMovementFormValues } from './inventory-movement.types';

import { movementTypeOptions } from './inventory-movement.fields';

export default function InventoryMovementForm() {
  const [showMovementDropdown, setShowMovementDropdown] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryMovementFormValues>({
    resolver: zodResolver(inventoryMovementSchema),

    defaultValues: {
      rawMaterialItem: '',
      movementType: 'stock_in',
      quantity: '',
      batchNo: '',
      lotNo: '',
      notes: '',
    },
  });

  const selectedMovement = watch('movementType');

  const onSubmit = (values: InventoryMovementFormValues) => {
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Raw Material Item */}
      <div>
        <label className="mb-2 block text-sm font-medium">Raw Material Item</label>

        <div className="relative">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-between rounded-lg border border-border px-4 text-sm text-muted-foreground"
          >
            Select item...
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Empty State */}
          <div className="mt-2 rounded-xl border bg-white p-4 shadow-md">
            <p className="text-sm text-muted-foreground">No raw material items found</p>
          </div>
        </div>

        {errors.rawMaterialItem && (
          <p className="mt-1 text-sm text-red-500">{errors.rawMaterialItem.message}</p>
        )}
      </div>

      {/* Movement Type */}
      <div className="relative">
        <label className="mb-2 block text-sm font-medium">Movement Type</label>

        <button
          type="button"
          onClick={() => setShowMovementDropdown(!showMovementDropdown)}
          className="flex h-12 w-full items-center justify-between rounded-lg border border-border px-4 text-sm"
        >
          {movementTypeOptions.find((item) => item.value === selectedMovement)?.label}

          <ChevronDown className="h-4 w-4" />
        </button>

        {showMovementDropdown && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white py-2 shadow-lg">
            {movementTypeOptions.map((item) => {
              const selected = item.value === selectedMovement;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setValue('movementType', item.value);

                    setShowMovementDropdown(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-muted ${
                    selected ? 'bg-slate-100' : ''
                  }`}
                >
                  <div className="w-4">{selected && <Check className="h-4 w-4" />}</div>

                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {errors.movementType && (
          <p className="mt-1 text-sm text-red-500">{errors.movementType.message}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="mb-2 block text-sm font-medium">Quantity</label>

        <input
          {...register('quantity')}
          placeholder="0.000"
          className="h-12 w-full rounded-lg border border-border px-4 text-sm"
        />

        {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>}
      </div>

      {/* Batch / Lot */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Batch #<span className="text-muted-foreground"> (optional)</span>
          </label>

          <input
            {...register('batchNo')}
            placeholder="e.g. B-2024-01"
            className="h-12 w-full rounded-lg border border-border px-4 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Lot #<span className="text-muted-foreground"> (optional)</span>
          </label>

          <input
            {...register('lotNo')}
            placeholder="e.g. L-001"
            className="h-12 w-full rounded-lg border border-border px-4 text-sm"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Notes
          <span className="text-muted-foreground"> (optional)</span>
        </label>

        <textarea
          {...register('notes')}
          rows={4}
          placeholder="Add any notes about this movement..."
          className="w-full rounded-lg border border-border p-4 text-sm"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" className="rounded-lg border px-5 py-2.5">
          Cancel
        </button>

        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white">
          Save Movement
        </button>
      </div>
    </form>
  );
}
