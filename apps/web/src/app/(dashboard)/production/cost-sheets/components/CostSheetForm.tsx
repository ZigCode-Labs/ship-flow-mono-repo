'use client';

import { useState } from 'react';
import { ArrowLeft, Save, DraftingCompass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeaderSection } from './HeaderSection';
import { ProductionCostSection } from './ProductionCostSection';
import { ComplianceCostSection } from './ComplianceCostSection';
import { PackagingCostSection } from './PackagingCostSection';
import { StorageHandlingSection } from './StorageHandlingSection';
import { ShippingExportSection } from './ShippingExportSection';
import { CostSummarySection } from './CostSummarySection';
import { MarginPricingSection } from './MarginPricingSection';
import { QuickSummary } from './QuickSummary';

interface CostSheetFormProps {
  onCancel?: () => void;
  onSave?: (data: any) => void;
}

const defaultValues = {
  date: new Date().toISOString().split('T')[0],
  shippingTerm: 'FOB',
  finishedItemName: '',
  batchQuantity: 1,
  unitOfMeasure: 'PCS',
  components: [],
  assemblyLabourCost: 0,
  finishingCost: 0,
  breakageDamageAllowancePercent: 0,
  qcInspectionCharges: 0,
  calculatedAmount: 0,
  inspectionAgency: '',
  certificationCosts: 0,
  certificationType: '',
  testingLabCharges: 0,
  rejectionReworkCostFixed: 0,
  packagingMode: 'flat',
  primaryInnerPackaging: 0,
  exportCartonMaster: 0,
  labellingMarking: 0,
  warehousingCostRate: 0,
  warehousingCost: 0,
  coldStorageRequired: false,
  coldStorageCost: 0,
  loadingUnloadingCharges: 0,
  inlandFreight: 0,
  portHandlingOrigin: 0,
  portTerminalCharges: 0,
  chaCustomClearanceFee: 0,
  exportDuty: 0,
  drawbackIncentive: 0,
  profitMarginPercent: 20,
  tradeBuyerDiscountPercent: 0,
  cashEarlyPaymentDiscountPercent: 0,
  agentCommissionPercent: 0,
  priceTerm: '',
  currency: 'INR',
};

export function CostSheetForm({ onCancel, onSave }: CostSheetFormProps) {
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [expandedSections, setExpandedSections] = useState<string[]>(['production']);
  const [isDraft, setIsDraft] = useState(false);

  const handleFieldChange = (fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    );
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  const handleSave = (asDraft: boolean = false) => {
    setIsDraft(asDraft);
    onSave?.({ ...values, isDraft: asDraft });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">New Cost Sheet</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleSave(true)}>
            <DraftingCompass className="mr-1.5 h-4 w-4" />
            Draft
          </Button>
          <Button size="sm" onClick={() => handleSave(false)}>
            <Save className="mr-1.5 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {/* Header Section */}
            <HeaderSection values={values} onChange={handleFieldChange} />

            {/* Production Cost Section */}
            <ProductionCostSection
              values={values}
              onChange={handleFieldChange}
              isExpanded={isSectionExpanded('production')}
              onToggle={() => toggleSection('production')}
            />

            {/* Quality, Compliance & Risk Costs */}
            <ComplianceCostSection
              values={values}
              onChange={handleFieldChange}
              isExpanded={isSectionExpanded('compliance')}
              onToggle={() => toggleSection('compliance')}
            />

            {/* Packaging Costs */}
            <PackagingCostSection
              values={values}
              onChange={handleFieldChange}
              isExpanded={isSectionExpanded('packaging')}
              onToggle={() => toggleSection('packaging')}
              productionCost={values._productionCost || 0}
            />

            {/* Storage & Handling Costs */}
            <StorageHandlingSection
              values={values}
              onChange={handleFieldChange}
              isExpanded={isSectionExpanded('storage')}
              onToggle={() => toggleSection('storage')}
            />

            {/* Shipping & Export Charges */}
            <ShippingExportSection
              values={values}
              onChange={handleFieldChange}
              isExpanded={isSectionExpanded('shipping')}
              onToggle={() => toggleSection('shipping')}
            />

            {/* Cost Summary */}
            <CostSummarySection values={values} />

            {/* Margin & Pricing */}
            <MarginPricingSection
              values={values}
              onChange={handleFieldChange}
              isExpanded={isSectionExpanded('margin')}
              onToggle={() => toggleSection('margin')}
            />
          </div>

          {/* Bottom Spacing */}
          <div className="h-10" />
        </div>

        {/* Right Sidebar - Quick Summary */}
        <div className="w-72 border-l bg-gray-50/50 p-5 overflow-y-auto">
          <QuickSummary values={values} />
        </div>
      </div>
    </div>
  );
}
