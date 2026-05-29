'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { CostSheetField } from './CostSheetField';
import { storageHandlingFields } from '../data/field-definitions';

const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '',
  KWD: 'د.ك',
  QAR: '',
  CNY: '¥',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  CHF: 'Fr',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  MYR: 'RM',
};

interface StorageHandlingSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function StorageHandlingSection({
  values,
  onChange,
  isExpanded,
  onToggle,
}: StorageHandlingSectionProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  const calculateTotal = () => {
    const warehousing = values.warehousingCost || 0;
    const coldStorage = values.coldStorageCost || 0;
    const loading = values.loadingUnloadingCharges || 0;
    const inland = values.inlandFreight || 0;
    const portHandling = values.portHandlingOrigin || 0;
    return warehousing + coldStorage + loading + inland + portHandling;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50/80 px-5 py-4 text-left hover:bg-gray-100/80 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">Storage & Handling Costs</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-600">
            {symbol}
            {calculateTotal().toFixed(0)}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white p-5">
          {/* Warehousing Cost */}
          <div className="mb-4 grid grid-cols-12 gap-3">
            <div className="col-span-2">
              <CostSheetField
                field={storageHandlingFields[0]}
                value={values.warehousingCostRate}
                onChange={(val) => onChange('warehousingCostRate', val)}
              />
            </div>
            <div className="col-span-10">
              <CostSheetField
                field={storageHandlingFields[1]}
                value={values.warehousingCost}
                onChange={(val) => onChange('warehousingCost', val)}
              />
            </div>
          </div>

          {/* Cold Storage Toggle */}
          <div className="mb-4 space-y-3">
            <CostSheetField
              field={storageHandlingFields[2]}
              value={values.coldStorageRequired}
              onChange={(val) => onChange('coldStorageRequired', val)}
            />
            {values.coldStorageRequired && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={values.coldStorageCost ?? ''}
                  onChange={(e) =>
                    onChange(
                      'coldStorageCost',
                      e.target.value === '' ? '' : parseFloat(e.target.value),
                    )
                  }
                  className="h-10 w-full rounded-[5px] border border-gray-200 pl-8 pr-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Loading / Unloading Charges */}
            <CostSheetField
              field={storageHandlingFields[3]}
              value={values.loadingUnloadingCharges}
              onChange={(val) => onChange('loadingUnloadingCharges', val)}
            />

            {/* Inland Freight */}
            <CostSheetField
              field={storageHandlingFields[4]}
              value={values.inlandFreight}
              onChange={(val) => onChange('inlandFreight', val)}
            />

            {/* Port Handling at Origin */}
            <CostSheetField
              field={storageHandlingFields[5]}
              value={values.portHandlingOrigin}
              onChange={(val) => onChange('portHandlingOrigin', val)}
            />
          </div>

          {/* Add Custom Attribute Button */}
          <button
            type="button"
            className="mt-4 flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-base leading-none">+</span> Add Custom Attribute
          </button>
        </div>
      )}
    </div>
  );
}
