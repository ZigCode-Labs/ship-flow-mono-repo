'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { CostSheetField } from './CostSheetField';
import { shippingExportFields } from '../data/field-definitions';

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

interface ShippingExportSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ShippingExportSection({
  values,
  onChange,
  isExpanded,
  onToggle,
}: ShippingExportSectionProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  const calculateTotal = () => {
    const portTerminal = values.portTerminalCharges || 0;
    const chaFee = values.chaCustomClearanceFee || 0;
    const exportDuty = values.exportDuty || 0;
    const drawback = values.drawbackIncentive || 0;
    return portTerminal + chaFee + exportDuty - drawback;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50/80 px-5 py-4 text-left hover:bg-gray-100/80 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">Shipping & Export Charges (FOB)</span>
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Port / Terminal Charges */}
            <CostSheetField
              field={shippingExportFields[0]}
              value={values.portTerminalCharges}
              onChange={(val) => onChange('portTerminalCharges', val)}
            />

            {/* CHA / Custom Clearance Fee */}
            <CostSheetField
              field={shippingExportFields[1]}
              value={values.chaCustomClearanceFee}
              onChange={(val) => onChange('chaCustomClearanceFee', val)}
            />

            {/* Export Duty */}
            <CostSheetField
              field={shippingExportFields[2]}
              value={values.exportDuty}
              onChange={(val) => onChange('exportDuty', val)}
            />

            {/* Drawback / Incentive */}
            <CostSheetField
              field={shippingExportFields[3]}
              value={values.drawbackIncentive}
              onChange={(val) => onChange('drawbackIncentive', val)}
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
