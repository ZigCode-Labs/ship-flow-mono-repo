'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { CostSheetField } from './CostSheetField';
import { marginPricingFields } from '../data/field-definitions';
import { cn } from '@/lib/utils';

const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
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

interface MarginPricingSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function MarginPricingSection({
  values,
  onChange,
  isExpanded,
  onToggle,
}: MarginPricingSectionProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  // Calculate Total Landed Cost
  const calculateTotalLandedCost = () => {
    const components = values.components || [];
    const productionCost = components.reduce((total: number, comp: any) => {
      const rawMaterialTotal = (comp.rawMaterials || []).reduce(
        (sum: number, rm: any) =>
          sum +
          (rm.qtyPerUnit || 0) * (rm.materialRate || 0) * (1 + (rm.wastagePercent || 0) / 100),
        0,
      );
      const labourTotal = (comp.labourProcesses || []).reduce(
        (sum: number, lp: any) => sum + (lp.processRate || 0),
        0,
      );
      return total + rawMaterialTotal + labourTotal;
    }, 0);

    const assemblyFinishing = (values.assemblyLabourCost || 0) + (values.finishingCost || 0);
    const packaging =
      (values.primaryInnerPackaging || 0) +
      (values.exportCartonMaster || 0) +
      (values.labellingMarking || 0);
    const compliance =
      (values.qcInspectionCharges || 0) +
      (values.calculatedAmount || 0) +
      (values.certificationCosts || 0) +
      (values.testingLabCharges || 0) +
      (values.rejectionReworkCostFixed || 0);
    const storageHandling =
      (values.warehousingCost || 0) +
      (values.coldStorageCost || 0) +
      (values.loadingUnloadingCharges || 0) +
      (values.inlandFreight || 0) +
      (values.portHandlingOrigin || 0);
    const shippingExport =
      (values.portTerminalCharges || 0) +
      (values.chaCustomClearanceFee || 0) +
      (values.exportDuty || 0) -
      (values.drawbackIncentive || 0);

    return (
      productionCost + assemblyFinishing + packaging + compliance + storageHandling + shippingExport
    );
  };

  const totalLandedCost = calculateTotalLandedCost();
  const batchQuantity = values.batchQuantity || 1;
  const perUnitLandedCost = totalLandedCost / batchQuantity;

  const profitMarginPercent = values.profitMarginPercent || 20;
  const profitMarginAmount = (perUnitLandedCost * profitMarginPercent) / 100;

  const tradeDiscountPercent = values.tradeBuyerDiscountPercent || 0;
  const earlyPaymentDiscountPercent = values.cashEarlyPaymentDiscountPercent || 0;
  const agentCommissionPercent = values.agentCommissionPercent || 0;

  const basePrice = perUnitLandedCost + profitMarginAmount;
  const tradeDiscount = (basePrice * tradeDiscountPercent) / 100;
  const earlyPaymentDiscount = (basePrice * earlyPaymentDiscountPercent) / 100;
  const agentCommission = (basePrice * agentCommissionPercent) / 100;

  const finalExportPrice = basePrice - tradeDiscount - earlyPaymentDiscount - agentCommission;
  const totalOrderValue = finalExportPrice * batchQuantity;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50/80 px-5 py-4 text-left hover:bg-gray-100/80 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">Margin & Pricing</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-600">
            {symbol}
            {finalExportPrice.toFixed(0)}
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
            {/* Total Landed Cost (read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Landed Cost (read-only)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {symbol}
                </span>
                <input
                  type="text"
                  readOnly
                  value={perUnitLandedCost.toFixed(0)}
                  className="h-10 w-full rounded-[5px] border border-gray-200 bg-gray-100 px-4 py-2 pl-8 text-sm text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Profit Margin % */}
            <CostSheetField
              field={marginPricingFields[0]}
              value={values.profitMarginPercent}
              onChange={(val) => onChange('profitMarginPercent', val)}
            />
          </div>

          {/* Margin Amount Display */}
          <div className="mt-3 flex justify-end">
            <span className="text-xs text-gray-500">
              Margin amount: {symbol}
              {profitMarginAmount.toFixed(0)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Trade / Buyer Discount % */}
            <CostSheetField
              field={marginPricingFields[1]}
              value={values.tradeBuyerDiscountPercent}
              onChange={(val) => onChange('tradeBuyerDiscountPercent', val)}
            />

            {/* Cash / Early Payment Discount % */}
            <CostSheetField
              field={marginPricingFields[2]}
              value={values.cashEarlyPaymentDiscountPercent}
              onChange={(val) => onChange('cashEarlyPaymentDiscountPercent', val)}
            />

            {/* Agent / Commission % */}
            <CostSheetField
              field={marginPricingFields[3]}
              value={values.agentCommissionPercent}
              onChange={(val) => onChange('agentCommissionPercent', val)}
            />

            {/* Price Term */}
            <CostSheetField
              field={marginPricingFields[4]}
              value={values.priceTerm}
              onChange={(val) => onChange('priceTerm', val)}
            />

            {/* Currency */}
            <CostSheetField
              field={marginPricingFields[5]}
              value={values.currency}
              onChange={(val) => onChange('currency', val)}
            />
          </div>

          {/* Final Pricing Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Final Export Price per Unit */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Final Export Price per Unit
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {symbol}
                {finalExportPrice.toFixed(0)}
              </p>
            </div>

            {/* Total Order Value */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Total Order Value ({batchQuantity} {values.unitOfMeasure || 'PCS'})
              </label>
              <p className="text-2xl font-bold text-gray-800">
                {symbol}
                {totalOrderValue.toFixed(0)}
              </p>
            </div>
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
