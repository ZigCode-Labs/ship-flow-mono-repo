'use client';

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

interface CostSummarySectionProps {
  values: Record<string, any>;
}

export function CostSummarySection({ values }: CostSummarySectionProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  // Calculate Production Cost from components
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

  // Calculate Assembly & Finishing
  const calculateAssemblyFinishing = () => {
    return (values.assemblyLabourCost || 0) + (values.finishingCost || 0);
  };

  // Calculate Packaging
  const calculatePackaging = () => {
    const mode = values.packagingMode || 'flat';
    if (mode === 'percentage') {
      const productionCost = calculateProductionCost() + calculateAssemblyFinishing();
      const packagingPercent = values.packagingCostPercent || 0;
      return (productionCost * packagingPercent) / 100 + (values.labellingMarking || 0);
    }
    return (
      (values.primaryInnerPackaging || 0) +
      (values.exportCartonMaster || 0) +
      (values.labellingMarking || 0)
    );
  };

  // Calculate Compliance
  const calculateCompliance = () => {
    return (
      (values.qcInspectionCharges || 0) +
      (values.calculatedAmount || 0) +
      (values.certificationCosts || 0) +
      (values.testingLabCharges || 0) +
      (values.rejectionReworkCostFixed || 0)
    );
  };

  // Calculate Storage & Handling
  const calculateStorageHandling = () => {
    return (
      (values.warehousingCost || 0) +
      (values.coldStorageCost || 0) +
      (values.loadingUnloadingCharges || 0) +
      (values.inlandFreight || 0) +
      (values.portHandlingOrigin || 0)
    );
  };

  // Calculate Shipping & Export
  const calculateShippingExport = () => {
    return (
      (values.portTerminalCharges || 0) +
      (values.chaCustomClearanceFee || 0) +
      (values.exportDuty || 0) -
      (values.drawbackIncentive || 0)
    );
  };

  const productionCost = calculateProductionCost();
  const assemblyFinishing = calculateAssemblyFinishing();
  const packaging = calculatePackaging();
  const compliance = calculateCompliance();
  const storageHandling = calculateStorageHandling();
  const shippingExport = calculateShippingExport();

  const totalLandedCost =
    productionCost + assemblyFinishing + packaging + compliance + storageHandling + shippingExport;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Cost Summary
      </h3>

      <div className="space-y-3">
        {/* Total Production Cost */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-sm text-gray-600">Total Production Cost</span>
          <span className="text-sm font-medium text-gray-800">
            {symbol}
            {(productionCost + assemblyFinishing).toFixed(0)}
          </span>
        </div>

        {/* Packaging */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-sm text-gray-600">Packaging</span>
          <span className="text-sm font-medium text-gray-800">
            {symbol}
            {packaging.toFixed(0)}
          </span>
        </div>

        {/* Quality, Compliance & Risk */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-sm text-gray-600">Quality, Compliance & Risk</span>
          <span className="text-sm font-medium text-gray-800">
            {symbol}
            {compliance.toFixed(0)}
          </span>
        </div>

        {/* Storage & Handling */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-sm text-gray-600">Storage & Handling</span>
          <span className="text-sm font-medium text-gray-800">
            {symbol}
            {storageHandling.toFixed(0)}
          </span>
        </div>

        {/* Shipping & Export */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-sm text-gray-600">Shipping & Export</span>
          <span className="text-sm font-medium text-gray-800">
            {symbol}
            {shippingExport.toFixed(0)}
          </span>
        </div>

        {/* Total Landed Cost */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Total Landed Cost
          </span>
          <span className="text-lg font-bold text-blue-600">
            {symbol}
            {totalLandedCost.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
