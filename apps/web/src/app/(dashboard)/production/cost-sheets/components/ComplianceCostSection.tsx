'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { CostSheetField } from './CostSheetField';
import { qualityComplianceFields } from '../data/field-definitions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ComplianceCostSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ComplianceCostSection({
  values,
  onChange,
  isExpanded,
  onToggle,
}: ComplianceCostSectionProps) {
  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  const calculateTotal = () => {
    const qcCharges = values.qcInspectionCharges || 0;
    const calcAmount = values.calculatedAmount || 0;
    const certCosts = values.certificationCosts || 0;
    const testingCharges = values.testingLabCharges || 0;
    const reworkCost = values.rejectionReworkCostFixed || 0;
    return qcCharges + calcAmount + certCosts + testingCharges + reworkCost;
  };

  const calculatedAmount = (() => {
    const breakagePercent = values.breakageDamageAllowancePercent || 0;
    const productionCost = values._productionCost || 0;
    return (productionCost * breakagePercent) / 100;
  })();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50/80 px-5 py-4 text-left hover:bg-gray-100/80 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">Quality, Compliance & Risk Costs</span>
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
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Breakage / Damage Allowance % */}
              <div className="space-y-1.5">
                <CostSheetField
                  field={qualityComplianceFields[0]}
                  value={values.breakageDamageAllowancePercent}
                  onChange={(val) => onChange('breakageDamageAllowancePercent', val)}
                />
                <p className="text-xs text-gray-500">
                  Calculated amount: {symbol}
                  {calculatedAmount.toFixed(0)}
                </p>
              </div>

              {/* QC / Inspection Charges */}
              <CostSheetField
                field={qualityComplianceFields[1]}
                value={values.qcInspectionCharges}
                onChange={(val) => onChange('qcInspectionCharges', val)}
              />

              {/* Inspection Agency */}
              <CostSheetField
                field={qualityComplianceFields[3]}
                value={values.inspectionAgency}
                onChange={(val) => onChange('inspectionAgency', val)}
              />

              {/* Certification Costs */}
              <CostSheetField
                field={qualityComplianceFields[4]}
                value={values.certificationCosts}
                onChange={(val) => onChange('certificationCosts', val)}
              />

              {/* Certification Types */}
              <CostSheetField
                field={{
                  ...qualityComplianceFields[5],
                  label: 'Certification Types',
                  placeholder: 'e.g. BIS, CE, REACH, OEKO-TEX',
                }}
                value={values.certificationType}
                onChange={(val) => onChange('certificationType', val)}
              />

              {/* Testing Lab Charges */}
              <CostSheetField
                field={qualityComplianceFields[6]}
                value={values.testingLabCharges}
                onChange={(val) => onChange('testingLabCharges', val)}
              />

              {/* Rejection / Rework Cost */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Rejection / Rework Cost
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={values.rejectionReworkCostType || 'fixed'}
                    onValueChange={(val) => onChange('rejectionReworkCostType', val)}
                  >
                    <SelectTrigger className="h-10 w-[120px] rounded-[5px] border border-gray-200 bg-white px-3 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed ₹</SelectItem>
                      <SelectItem value="percent">% of cost</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={values.rejectionReworkCostFixed ?? ''}
                      onChange={(e) =>
                        onChange(
                          'rejectionReworkCostFixed',
                          e.target.value === '' ? '' : parseFloat(e.target.value),
                        )
                      }
                      className="h-10 w-full rounded-[5px] border border-gray-200 pl-8 pr-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
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
