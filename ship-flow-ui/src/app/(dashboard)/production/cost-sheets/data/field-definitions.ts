// Field definitions for Cost Sheet Form
// Based on the images provided - structured for reusability

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'textarea'
  | 'currency'
  | 'percentage'
  | 'toggle'
  | 'button-group';

export interface FieldOption {
  label: string;
  value: string;
  description?: string;
}

export interface BaseField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValue?: any;
  className?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
}

export interface TextField extends BaseField {
  type: 'text' | 'textarea';
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

export interface NumberField extends BaseField {
  type: 'number' | 'currency' | 'percentage';
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: FieldOption[];
}

export interface RadioField extends BaseField {
  type: 'radio' | 'button-group';
  options: FieldOption[];
  inline?: boolean;
}

export interface ToggleField extends BaseField {
  type: 'toggle';
}

export interface DateField extends BaseField {
  type: 'date';
}

export type FieldDefinition =
  | TextField
  | NumberField
  | SelectField
  | RadioField
  | ToggleField
  | DateField;

// ============== HEADER FIELDS ==============
export const headerFields: FieldDefinition[] = [
  {
    id: 'date',
    name: 'date',
    type: 'date',
    label: 'Date',
    required: true,
  },
  {
    id: 'shippingTerm',
    name: 'shippingTerm',
    type: 'button-group',
    label: 'Shipping term',
    required: true,
    defaultValue: 'FOB',
    options: [
      { label: 'FOB', value: 'FOB' },
      { label: 'CIF', value: 'CIF' },
      { label: 'Air', value: 'Air' },
      { label: 'Courier', value: 'Courier' },
    ],
  },
  {
    id: 'finishedItemName',
    name: 'finishedItemName',
    type: 'text',
    label: 'Finished item name',
    placeholder: 'e.g. Brass Candle Holder Set',
    required: true,
  },
  {
    id: 'batchQuantity',
    name: 'batchQuantity',
    type: 'number',
    label: 'Batch quantity',
    required: true,
    defaultValue: 1,
    min: 1,
  },
  {
    id: 'unitOfMeasure',
    name: 'unitOfMeasure',
    type: 'select',
    label: 'Unit of measure',
    required: true,
    defaultValue: 'PCS',
    options: [
      { label: 'PCS', value: 'PCS' },
      { label: 'KG', value: 'KG' },
      { label: 'MTR', value: 'MTR' },
      { label: 'SET', value: 'SET' },
      { label: 'BOX', value: 'BOX' },
      { label: 'LTR', value: 'LTR' },
      { label: 'TON', value: 'TON' },
      { label: 'PAIR', value: 'PAIR' },
      { label: 'DOZEN', value: 'DOZEN' },
      { label: 'SQM', value: 'SQM' },
    ],
  },
];

// ============== COMPONENT-WISE PRODUCTION COST FIELDS ==============
export const componentProductionFields: FieldDefinition[] = [
  {
    id: 'componentName',
    name: 'componentName',
    type: 'text',
    label: 'Component name',
    placeholder: 'e.g. Metal Body',
    required: true,
  },
  {
    id: 'productionSource',
    name: 'productionSource',
    type: 'select',
    label: 'Production source',
    required: true,
    defaultValue: 'in-house',
    options: [
      { label: 'In-house', value: 'in-house' },
      { label: 'Outsourced', value: 'outsourced' },
      { label: 'Imported', value: 'imported' },
    ],
  },
];

export const rawMaterialFields: FieldDefinition[] = [
  {
    id: 'materialName',
    name: 'materialName',
    type: 'text',
    label: 'Material Name',
    placeholder: 'RM name',
    required: true,
  },
  {
    id: 'qtyPerUnit',
    name: 'qtyPerUnit',
    type: 'number',
    label: 'Qty/Unit',
    required: true,
    defaultValue: 1,
    min: 0,
  },
  {
    id: 'materialRate',
    name: 'materialRate',
    type: 'currency',
    label: 'Rate ₹',
    required: true,
    defaultValue: 0,
    min: 0,
    prefix: '₹',
  },
  {
    id: 'wastagePercent',
    name: 'wastagePercent',
    type: 'percentage',
    label: 'Wastage %',
    defaultValue: 0,
    min: 0,
    max: 100,
    suffix: '%',
  },
];

export const labourProcessFields: FieldDefinition[] = [
  {
    id: 'processName',
    name: 'processName',
    type: 'text',
    label: 'Process',
    placeholder: 'e.g. Polishing',
    required: true,
  },
  {
    id: 'processType',
    name: 'processType',
    type: 'select',
    label: 'Type',
    required: true,
    defaultValue: 'in-house',
    options: [
      { label: 'In-house', value: 'in-house' },
      { label: 'Job Work', value: 'job-work' },
    ],
  },
  {
    id: 'processRate',
    name: 'processRate',
    type: 'currency',
    label: 'Rate ₹',
    required: true,
    defaultValue: 0,
    min: 0,
    prefix: '₹',
  },
];

export const assemblyFinishingFields: FieldDefinition[] = [
  {
    id: 'assemblyLabourCost',
    name: 'assemblyLabourCost',
    type: 'currency',
    label: 'Assembly labour cost',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'finishingCost',
    name: 'finishingCost',
    type: 'currency',
    label: 'Finishing cost',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
];

// ============== QUALITY, COMPLIANCE & RISK COSTS FIELDS ==============
export const qualityComplianceFields: FieldDefinition[] = [
  {
    id: 'breakageDamageAllowancePercent',
    name: 'breakageDamageAllowancePercent',
    type: 'percentage',
    label: 'Breakage / damage allowance %',
    placeholder: '0',
    min: 0,
    max: 100,
    suffix: '%',
  },
  {
    id: 'qcInspectionCharges',
    name: 'qcInspectionCharges',
    type: 'currency',
    label: 'QC / inspection charges',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'calculatedAmount',
    name: 'calculatedAmount',
    type: 'currency',
    label: 'Calculated amount',
    placeholder: '0',
    readOnly: true,
    prefix: '₹',
    helperText: 'Auto-calculated based on percentage',
  },
  {
    id: 'inspectionAgency',
    name: 'inspectionAgency',
    type: 'text',
    label: 'Inspection agency',
    placeholder: 'e.g. SGS, Bureau Veritas',
  },
  {
    id: 'certificationCosts',
    name: 'certificationCosts',
    type: 'currency',
    label: 'Certification costs',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'certificationType',
    name: 'certificationType',
    type: 'text',
    label: 'Certification type',
    placeholder: 'e.g. BIS, CE, REACH, CERO-TEK',
  },
  {
    id: 'testingLabCharges',
    name: 'testingLabCharges',
    type: 'currency',
    label: 'Testing lab charges',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'rejectionReworkCostFixed',
    name: 'rejectionReworkCostFixed',
    type: 'currency',
    label: 'Fixed ₹',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
];

// ============== PACKAGING COSTS FIELDS ==============
export const packagingFields: FieldDefinition[] = [
  {
    id: 'packagingMode',
    name: 'packagingMode',
    type: 'button-group',
    label: 'Mode',
    required: true,
    defaultValue: 'flat',
    options: [
      { label: 'Flat Item', value: 'flat' },
      { label: '% of Production', value: 'percentage' },
    ],
  },
  {
    id: 'primaryInnerPackaging',
    name: 'primaryInnerPackaging',
    type: 'currency',
    label: 'Primary / inner packaging',
    placeholder: '0',
    helperText: 'Tissue, bubble wrap, inner box',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'exportCartonMaster',
    name: 'exportCartonMaster',
    type: 'currency',
    label: 'Export carton / master',
    placeholder: '0',
    helperText: 'Outer carton, strapping',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'labellingMarking',
    name: 'labellingMarking',
    type: 'currency',
    label: 'Labelling & marking',
    placeholder: '0',
    helperText: 'Counts toward Storage & Handling total',
    min: 0,
    prefix: '₹',
  },
];

// ============== STORAGE & HANDLING COSTS FIELDS ==============
export const storageHandlingFields: FieldDefinition[] = [
  {
    id: 'warehousingCostRate',
    name: 'warehousingCostRate',
    type: 'number',
    label: 'Per',
    placeholder: 'Rate',
    min: 0,
  },
  {
    id: 'warehousingCost',
    name: 'warehousingCost',
    type: 'currency',
    label: 'Warehousing cost',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'coldStorageRequired',
    name: 'coldStorageRequired',
    type: 'toggle',
    label: 'Cold storage required',
  },
  {
    id: 'loadingUnloadingCharges',
    name: 'loadingUnloadingCharges',
    type: 'currency',
    label: 'Loading / unloading charges',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'inlandFreight',
    name: 'inlandFreight',
    type: 'currency',
    label: 'Inland freight (factory → port)',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'portHandlingOrigin',
    name: 'portHandlingOrigin',
    type: 'currency',
    label: 'Port handling at origin',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
];

// ============== SHIPPING & EXPORT CHARGES (FOB) FIELDS ==============
export const shippingExportFields: FieldDefinition[] = [
  {
    id: 'portTerminalCharges',
    name: 'portTerminalCharges',
    type: 'currency',
    label: 'Port / terminal charges',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'chaCustomClearanceFee',
    name: 'chaCustomClearanceFee',
    type: 'currency',
    label: 'CHA / custom clearance fee',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'exportDuty',
    name: 'exportDuty',
    type: 'currency',
    label: 'Export duty (if applicable)',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
  {
    id: 'drawbackIncentive',
    name: 'drawbackIncentive',
    type: 'currency',
    label: 'Drawback / incentive (deducted)',
    placeholder: '0',
    min: 0,
    prefix: '₹',
  },
];

// ============== MARGIN & PRICING FIELDS ==============
export const marginPricingFields: FieldDefinition[] = [
  {
    id: 'profitMarginPercent',
    name: 'profitMarginPercent',
    type: 'percentage',
    label: 'Profit margin %',
    placeholder: '20',
    defaultValue: 20,
    min: 0,
    max: 100,
    suffix: '%',
  },
  {
    id: 'tradeBuyerDiscountPercent',
    name: 'tradeBuyerDiscountPercent',
    type: 'percentage',
    label: 'Trade / buyer discount %',
    placeholder: '0',
    min: 0,
    max: 100,
    suffix: '%',
  },
  {
    id: 'cashEarlyPaymentDiscountPercent',
    name: 'cashEarlyPaymentDiscountPercent',
    type: 'percentage',
    label: 'Cash / early payment discount %',
    placeholder: '0',
    min: 0,
    max: 100,
    suffix: '%',
  },
  {
    id: 'agentCommissionPercent',
    name: 'agentCommissionPercent',
    type: 'percentage',
    label: 'Agent / commission %',
    placeholder: '0',
    min: 0,
    max: 100,
    suffix: '%',
  },
  {
    id: 'priceTerm',
    name: 'priceTerm',
    type: 'text',
    label: 'Price term',
    placeholder: 'e.g. FOB Mumbai',
  },
  {
    id: 'currency',
    name: 'currency',
    type: 'select',
    label: 'Currency',
    required: true,
    defaultValue: 'INR',
    options: [
      { label: 'INR', value: 'INR' },
      { label: 'USD', value: 'USD' },
      { label: 'EUR', value: 'EUR' },
      { label: 'GBP', value: 'GBP' },
      { label: 'AED', value: 'AED' },
      { label: 'SAR', value: 'SAR' },
      { label: 'KWD', value: 'KWD' },
      { label: 'QAR', value: 'QAR' },
      { label: 'CNY', value: 'CNY' },
      { label: 'JPY', value: 'JPY' },
      { label: 'AUD', value: 'AUD' },
      { label: 'CAD', value: 'CAD' },
      { label: 'SGD', value: 'SGD' },
      { label: 'CHF', value: 'CHF' },
      { label: 'SEK', value: 'SEK' },
      { label: 'NOK', value: 'NOK' },
      { label: 'DKK', value: 'DKK' },
      { label: 'MYR', value: 'MYR' },
    ],
  },
];

// ============== SECTION DEFINITIONS ==============
export interface SectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FieldDefinition[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
}

export const costSheetSections: SectionDefinition[] = [
  {
    id: 'header',
    title: 'HEADER',
    fields: headerFields,
    collapsible: false,
  },
  {
    id: 'production',
    title: 'Component-wise Production Cost',
    description: 'Add components with their raw materials and labour processes',
    fields: componentProductionFields,
    collapsible: true,
    defaultExpanded: false,
    showTotal: true,
    totalLabel: 'Component Subtotal',
  },
  {
    id: 'compliance',
    title: 'Quality, Compliance & Risk Costs',
    description: 'Inspection, certification, and quality-related costs',
    fields: qualityComplianceFields,
    collapsible: true,
    defaultExpanded: false,
    showTotal: true,
  },
  {
    id: 'packaging',
    title: 'Packaging Costs',
    fields: packagingFields,
    collapsible: true,
    defaultExpanded: false,
    showTotal: true,
  },
  {
    id: 'storage',
    title: 'Storage & Handling Costs',
    fields: storageHandlingFields,
    collapsible: true,
    defaultExpanded: false,
    showTotal: true,
  },
  {
    id: 'shipping',
    title: 'Shipping & Export Charges (FOB)',
    fields: shippingExportFields,
    collapsible: true,
    defaultExpanded: false,
    showTotal: true,
  },
  {
    id: 'margin',
    title: 'Margin & Pricing',
    fields: marginPricingFields,
    collapsible: true,
    defaultExpanded: false,
  },
];
