'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, GripVertical } from 'lucide-react';
import { CostSheetField } from './CostSheetField';
import { componentProductionFields, assemblyFinishingFields } from '../data/field-definitions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface RawMaterial {
  id: string;
  materialName: string;
  qtyPerUnit: number;
  materialRate: number;
  wastagePercent: number;
}

interface LabourProcess {
  id: string;
  processName: string;
  processType: 'in-house' | 'job-work';
  processRate: number;
}

interface Component {
  id: string;
  componentName: string;
  productionSource: string;
  rawMaterials: RawMaterial[];
  labourProcesses: LabourProcess[];
}

interface ProductionCostSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ProductionCostSection({
  values,
  onChange,
  isExpanded: sectionExpanded = true,
  onToggle,
}: ProductionCostSectionProps) {
  const [components, setComponents] = useState<Component[]>(
    values.components?.length > 0
      ? values.components
      : [
          {
            id: 'comp-default',
            componentName: 'New Component',
            productionSource: 'in-house',
            rawMaterials: [],
            labourProcesses: [],
          },
        ],
  );
  const [expandedComponents, setExpandedComponents] = useState<string[]>([]);
  const [sectionOpen, setSectionOpen] = useState(sectionExpanded);

  const handleAddComponent = () => {
    const newComponent: Component = {
      id: `comp-${Date.now()}`,
      componentName: '',
      productionSource: 'in-house',
      rawMaterials: [],
      labourProcesses: [],
    };
    const updated = [...components, newComponent];
    setComponents(updated);
    setExpandedComponents([...expandedComponents, newComponent.id]);
    onChange('components', updated);
  };

  const handleRemoveComponent = (id: string) => {
    const updated = components.filter((c) => c.id !== id);
    setComponents(updated);
    onChange('components', updated);
  };

  const handleUpdateComponent = (id: string, field: string, value: any) => {
    const updated = components.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setComponents(updated);
    onChange('components', updated);
  };

  const toggleComponentExpand = (id: string) => {
    setExpandedComponents((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const calculateComponentTotal = (component: Component): number => {
    const rawMaterialTotal = component.rawMaterials.reduce((sum, rm) => {
      const qty = rm.qtyPerUnit || 0;
      const rate = rm.materialRate || 0;
      const wastage = rm.wastagePercent || 0;
      const totalWithWastage = qty * rate * (1 + wastage / 100);
      return sum + totalWithWastage;
    }, 0);
    const labourTotal = component.labourProcesses.reduce(
      (sum, lp) => sum + (lp.processRate || 0),
      0,
    );
    return rawMaterialTotal + labourTotal;
  };

  const totalComponentCost = components.reduce((sum, c) => sum + calculateComponentTotal(c), 0);

  const assemblyCost = values.assemblyLabourCost || 0;
  const finishingCost = values.finishingCost || 0;
  const totalProductionCost = totalComponentCost + assemblyCost + finishingCost;

  const currency = values.currency || 'INR';
  const symbol = currencySymbols[currency] || '₹';

  useEffect(() => {
    if (values._productionCost !== totalProductionCost) {
      onChange('_productionCost', totalProductionCost);
    }
  }, [totalProductionCost, values._productionCost, onChange]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setSectionOpen(!sectionOpen)}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">Component-wise Production Cost</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-blue-600">
            {symbol}
            {totalProductionCost.toFixed(0)}
          </span>
          {sectionOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {sectionOpen && (
        <div className="p-4 space-y-3">
          {/* Components List */}
          {components.map((component, index) => (
            <ComponentCard
              key={component.id}
              component={component}
              index={index}
              isExpanded={expandedComponents.includes(component.id)}
              onToggle={() => toggleComponentExpand(component.id)}
              onUpdate={handleUpdateComponent}
              onRemove={() => handleRemoveComponent(component.id)}
              symbol={symbol}
            />
          ))}

          {/* Add Component Button */}
          <button
            type="button"
            onClick={handleAddComponent}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Component
          </button>

          {/* Assembly & Finishing */}
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/30 overflow-hidden">
            <div className="px-4 py-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Assembly & Finishing
              </h4>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CostSheetField
                  field={assemblyFinishingFields[0]}
                  value={values.assemblyLabourCost}
                  onChange={(val) => onChange('assemblyLabourCost', val)}
                  bgWhite
                />
                <CostSheetField
                  field={assemblyFinishingFields[1]}
                  value={values.finishingCost}
                  onChange={(val) => onChange('finishingCost', val)}
                  bgWhite
                />
              </div>
            </div>
          </div>

          {/* Add Custom Attribute Button */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Custom Attribute
          </button>
        </div>
      )}
    </div>
  );
}

interface ComponentCardProps {
  component: Component;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: () => void;
  symbol: string;
}

function ComponentCard({
  component,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  symbol,
}: ComponentCardProps) {
  const handleAddRawMaterial = () => {
    const newMaterial: RawMaterial = {
      id: `rm-${Date.now()}`,
      materialName: '',
      qtyPerUnit: 1,
      materialRate: 0,
      wastagePercent: 0,
    };
    onUpdate(component.id, 'rawMaterials', [...component.rawMaterials, newMaterial]);
  };

  const handleRemoveRawMaterial = (rmId: string) => {
    onUpdate(
      component.id,
      'rawMaterials',
      component.rawMaterials.filter((rm) => rm.id !== rmId),
    );
  };

  const handleUpdateRawMaterial = (rmId: string, field: string, value: any) => {
    onUpdate(
      component.id,
      'rawMaterials',
      component.rawMaterials.map((rm) => (rm.id === rmId ? { ...rm, [field]: value } : rm)),
    );
  };

  const handleAddLabourProcess = () => {
    const newProcess: LabourProcess = {
      id: `lp-${Date.now()}`,
      processName: '',
      processType: 'in-house',
      processRate: 0,
    };
    onUpdate(component.id, 'labourProcesses', [...component.labourProcesses, newProcess]);
  };

  const handleRemoveLabourProcess = (lpId: string) => {
    onUpdate(
      component.id,
      'labourProcesses',
      component.labourProcesses.filter((lp) => lp.id !== lpId),
    );
  };

  const handleUpdateLabourProcess = (lpId: string, field: string, value: any) => {
    onUpdate(
      component.id,
      'labourProcesses',
      component.labourProcesses.map((lp) => (lp.id === lpId ? { ...lp, [field]: value } : lp)),
    );
  };

  const rawMaterialTotal = component.rawMaterials.reduce((sum, rm) => {
    const qty = rm.qtyPerUnit || 0;
    const rate = rm.materialRate || 0;
    const wastage = rm.wastagePercent || 0;
    return sum + qty * rate * (1 + wastage / 100);
  }, 0);
  const labourTotal = component.labourProcesses.reduce((sum, lp) => sum + (lp.processRate || 0), 0);
  const componentTotal = rawMaterialTotal + labourTotal;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Component Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-xs font-medium text-gray-600">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {component.componentName || 'New card'}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600">
            {component.productionSource === 'in-house'
              ? 'In-house'
              : component.productionSource === 'outsourced'
                ? 'Outsourced'
                : 'Imported'}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-blue-600">
            {symbol}
            {componentTotal.toFixed(0)}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Component Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Component Name and Production Source */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Component Name</label>
              <input
                type="text"
                placeholder="e.g. Metal Body"
                value={component.componentName}
                onChange={(e) => onUpdate(component.id, 'componentName', e.target.value)}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Production Source</label>
              <Select
                value={component.productionSource}
                onValueChange={(val) => onUpdate(component.id, 'productionSource', val)}
              >
                <SelectTrigger className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-house">In-house</SelectItem>
                  <SelectItem value="outsourced">Outsourced</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Raw Materials */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-700">Raw Materials</h5>
              <button
                type="button"
                onClick={handleAddRawMaterial}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Plus className="h-4 w-4" />
                Add RM
              </button>
            </div>

            {component.rawMaterials.length === 0 ? (
              <p className="text-sm text-gray-500">No raw materials added yet.</p>
            ) : (
              <div className="space-y-2">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-500">
                  <div className="col-span-3">Material Name</div>
                  <div className="col-span-2 text-center">Qty/Unit</div>
                  <div className="col-span-2 text-center">Rate {symbol}</div>
                  <div className="col-span-2 text-center">Wastage %</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                {component.rawMaterials.map((rm) => {
                  const rmTotal =
                    (rm.qtyPerUnit || 0) *
                    (rm.materialRate || 0) *
                    (1 + (rm.wastagePercent || 0) / 100);
                  return (
                    <div key={rm.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="RM name"
                          value={rm.materialName}
                          onChange={(e) =>
                            handleUpdateRawMaterial(rm.id, 'materialName', e.target.value)
                          }
                          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="1"
                          value={rm.qtyPerUnit || ''}
                          onChange={(e) =>
                            handleUpdateRawMaterial(
                              rm.id,
                              'qtyPerUnit',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            {symbol}
                          </span>
                          <input
                            type="number"
                            placeholder="0"
                            value={rm.materialRate || ''}
                            onChange={(e) =>
                              handleUpdateRawMaterial(
                                rm.id,
                                'materialRate',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="h-9 w-full rounded-md border border-gray-200 bg-white pl-6 pr-2 text-sm text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={rm.wastagePercent || ''}
                          onChange={(e) =>
                            handleUpdateRawMaterial(
                              rm.id,
                              'wastagePercent',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="col-span-2 text-right text-sm text-gray-700">
                        {symbol}
                        {rmTotal.toFixed(0)}
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveRawMaterial(rm.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <span className="sr-only">Remove</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Labour Processes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-700">Labour Processes</h5>
              <button
                type="button"
                onClick={handleAddLabourProcess}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Plus className="h-4 w-4" />
                Add Process
              </button>
            </div>

            {component.labourProcesses.length === 0 ? (
              <p className="text-sm text-gray-500">No labour processes added yet.</p>
            ) : (
              <div className="space-y-2">
                {component.labourProcesses.map((lp) => (
                  <div key={lp.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="e.g. Polishing"
                        value={lp.processName}
                        onChange={(e) =>
                          handleUpdateLabourProcess(lp.id, 'processName', e.target.value)
                        }
                        className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={lp.processType}
                        onValueChange={(val) =>
                          handleUpdateLabourProcess(lp.id, 'processType', val)
                        }
                      >
                        <SelectTrigger className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-house">In-house</SelectItem>
                          <SelectItem value="job-work">Job Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          {symbol}
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={lp.processRate || ''}
                          onChange={(e) =>
                            handleUpdateLabourProcess(
                              lp.id,
                              'processRate',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-9 w-full rounded-md border border-gray-200 bg-white pl-7 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveLabourProcess(lp.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Component Subtotal */}
          <div className="flex justify-end border-t border-gray-200 pt-3">
            <div className="text-right">
              <span className="text-sm text-gray-600">Component Subtotal: </span>
              <span className="text-sm font-semibold text-gray-900">
                {symbol}
                {componentTotal.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
