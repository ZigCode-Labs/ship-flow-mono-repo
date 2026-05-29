'use client';

import { ImagePlus, Building2, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface QuickSummaryProps {
  values: Record<string, any>;
}

export function QuickSummary({ values }: QuickSummaryProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  // Calculate all costs
  const calculateProductionCost = () => {
    const components = values.components || [];
    return components.reduce((total: number, comp: any) => {
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
  };

  const productionCost =
    calculateProductionCost() + (values.assemblyLabourCost || 0) + (values.finishingCost || 0);
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

  const totalLandedCost =
    productionCost + packaging + compliance + storageHandling + shippingExport;

  // Calculate final price
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
    <div className="space-y-5">
      {/* Item Image Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Item Image
        </h3>

        {/* Image Placeholder */}
        <div className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10">
          <ImagePlus className="mb-2 h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-400">No image uploaded</p>
        </div>

        {/* Image Actions */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
            <Building2 className="h-3.5 w-3.5" />
            Select From Register
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" />
            Upload Image
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            AI Auto Fill
          </Button>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Quick Summary
        </h3>

        <div className="space-y-2.5">
          {/* Production */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Production</span>
            <span className="text-xs font-medium text-gray-700">
              {symbol}
              {productionCost.toFixed(0)}
            </span>
          </div>

          {/* Packaging */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Packaging</span>
            <span className="text-xs font-medium text-gray-700">
              {symbol}
              {packaging.toFixed(0)}
            </span>
          </div>

          {/* Compliance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Compliance</span>
            <span className="text-xs font-medium text-gray-700">
              {symbol}
              {compliance.toFixed(0)}
            </span>
          </div>

          {/* Storage */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Storage</span>
            <span className="text-xs font-medium text-gray-700">
              {symbol}
              {storageHandling.toFixed(0)}
            </span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Shipping</span>
            <span className="text-xs font-medium text-gray-700">
              {symbol}
              {shippingExport.toFixed(0)}
            </span>
          </div>

          {/* Landed Cost */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-2.5">
            <span className="text-xs font-medium text-gray-600">Landed Cost</span>
            <span className="text-xs font-semibold text-gray-800">
              {symbol}
              {totalLandedCost.toFixed(0)}
            </span>
          </div>

          {/* Final Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Final Price</span>
            <span className="text-xs font-semibold text-blue-600">
              {symbol}
              {finalExportPrice.toFixed(0)}
            </span>
          </div>

          {/* Total Order Value */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Total Value</span>
            <span className="text-xs font-semibold text-gray-800">
              {symbol}
              {totalOrderValue.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
