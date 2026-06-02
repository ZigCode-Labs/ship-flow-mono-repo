'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { CostSheetField } from './CostSheetField';
import { packagingFields } from '../data/field-definitions';
import { Label } from '@/components/ui/label';

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

interface PackagingCostSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  isExpanded: boolean;
  onToggle: () => void;
  productionCost?: number;
}

function FlatItemsMode({
  values,
  onChange,
}: {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Primary / Inner Packaging */}
        <CostSheetField
          field={packagingFields[1]}
          value={values.primaryInnerPackaging}
          onChange={(val) => onChange('primaryInnerPackaging', val)}
        />

        {/* Export Carton / Master */}
        <CostSheetField
          field={packagingFields[2]}
          value={values.exportCartonMaster}
          onChange={(val) => onChange('exportCartonMaster', val)}
        />
      </div>

      {/* Labelling & Marking */}
      <CostSheetField
        field={packagingFields[3]}
        value={values.labellingMarking}
        onChange={(val) => onChange('labellingMarking', val)}
      />
    </div>
  );
}

function PercentageOfProductionMode({
  values,
  onChange,
  productionCost,
}: {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  productionCost?: number;
}) {
  const packagingPercent = values.packagingCostPercent || 0;
  const computedAmount = ((productionCost || 0) * packagingPercent) / 100;

  return (
    <div className="space-y-5">
      {/* Packaging Cost % of Production Cost */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Packaging Cost % of Production Cost
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative w-[200px]">
            <input
              type="number"
              placeholder="0"
              value={values.packagingCostPercent ?? ''}
              onChange={(e) =>
                onChange(
                  'packagingCostPercent',
                  e.target.value === '' ? '' : parseFloat(e.target.value),
                )
              }
              className="h-10 w-full rounded-[5px] border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>
          <span className="text-sm text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500">
          Computed amount: {computedAmount.toFixed(0)} — covers primary + export + labelling collectively
        </p>
      </div>

      {/* Labelling & Marking */}
      <CostSheetField
        field={packagingFields[3]}
        value={values.labellingMarking}
        onChange={(val) => onChange('labellingMarking', val)}
      />
    </div>
  );
}

export function PackagingCostSection({
  values,
  onChange,
  isExpanded,
  onToggle,
  productionCost = 0,
}: PackagingCostSectionProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  const calculateTotal = () => {
    const mode = values.packagingMode || 'flat';
    if (mode === 'percentage') {
      const packagingPercent = values.packagingCostPercent || 0;
      const computedAmount = (productionCost * packagingPercent) / 100;
      const labelling = values.labellingMarking || 0;
      return computedAmount + labelling;
    }
    const primary = values.primaryInnerPackaging || 0;
    const exportCarton = values.exportCartonMaster || 0;
    const labelling = values.labellingMarking || 0;
    return primary + exportCarton + labelling;
  };

  const isFlatMode = values.packagingMode === 'flat' || !values.packagingMode;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50/80 px-5 py-4 text-left hover:bg-gray-100/80 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">Packaging Costs</span>
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
          {/* Mode Selection */}
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Mode:</span>
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
                <button
                  type="button"
                  onClick={() => onChange('packagingMode', 'flat')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    isFlatMode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Flat Items
                </button>
                <button
                  type="button"
                  onClick={() => onChange('packagingMode', 'percentage')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    !isFlatMode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  % of Production
                </button>
              </div>
            </div>
          </div>

          {/* Conditional rendering based on mode */}
          <div className="rounded-xl border border-gray-200 p-5">
            {isFlatMode ? (
              <FlatItemsMode values={values} onChange={onChange} />
            ) : (
              <PercentageOfProductionMode
                values={values}
                onChange={onChange}
                productionCost={productionCost}
              />
            )}
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
