'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import formConfigImport from '../data/sample-delivery-challan.json';
import {
  DeliveryChallan,
  DeliveryChallanDataSourceOption,
  DeliveryChallanFormConfig,
  DeliveryChallanFormField,
} from '../types';

interface DeliveryChallanFormProps {
  deliveryChallan?: DeliveryChallan;
  isNew: boolean;
  onSave: (deliveryChallan: DeliveryChallan) => void;
  onCancel: () => void;
}

type DeliveryChallanSampleConfig = {
  deliveryChallans: DeliveryChallan[];
  formConfig: DeliveryChallanFormConfig;
};

type FormValues = Record<string, string>;
type LineItem = DeliveryChallan['lineItems'][number];

const typedFormConfig = (formConfigImport as DeliveryChallanSampleConfig).formConfig;
const fieldClass =
  'h-[41px] rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500/20';
const labelClass = 'text-[10px] font-semibold leading-none text-slate-950';
const sectionClass = 'rounded-sm border border-slate-200 bg-white p-3';

function generateChallanNumber(): string {
  const now = new Date();
  const year = now.getFullYear() % 100;
  const nextYear = (now.getFullYear() + 1) % 100;
  return `DC-${year}-${nextYear.toString().padStart(2, '0')}-001`;
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function findField(id: string): DeliveryChallanFormField | undefined {
  for (const section of typedFormConfig.sections) {
    const field = section.fields.find((item) => item.id === id);
    if (field) return field;
  }

  return undefined;
}

function getOptions(dataSource?: string): DeliveryChallanDataSourceOption[] {
  if (!dataSource) return [];
  const source =
    typedFormConfig.dataSources[dataSource as keyof DeliveryChallanFormConfig['dataSources']];

  return Array.isArray(source) ? source : [];
}

function getFieldInitialValue(field: DeliveryChallanFormField): string {
  if (field.autoGenerate) return '';
  if (field.defaultToday) return todayIso();
  if (field.defaultValue !== undefined) return String(field.defaultValue);
  if (field.sourceFrom === 'sellerProfile.companyName') {
    return typedFormConfig.sellerProfile.companyName;
  }
  if (field.sourceFrom === 'sellerProfile.gstin') return typedFormConfig.sellerProfile.gstin;
  if (field.sourceFrom === 'sellerProfile.state') return typedFormConfig.sellerProfile.state;

  return '';
}

function generateInitialFormValues(deliveryChallan?: DeliveryChallan): FormValues {
  const values: FormValues = {};

  typedFormConfig.sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = getFieldInitialValue(field);
    });
  });

  if (!deliveryChallan) return values;

  return {
    ...values,
    dc_number: deliveryChallan.challanNumber,
    dc_date: deliveryChallan.challanDate,
    delivery_type: values.delivery_type || 'supply_of_goods',
    company_name: deliveryChallan.companyName,
    select_buyer: deliveryChallan.customerId || '',
    buyer_name: deliveryChallan.customerName,
    buyer_gstin: deliveryChallan.customerGstin,
    buyer_address: deliveryChallan.buyerAddress || '',
    buyer_state: deliveryChallan.placeOfSupply,
    place_delivery: deliveryChallan.placeOfSupply,
    expected_delivery_date: deliveryChallan.deliveryDate,
    linked_invoice_id: deliveryChallan.reference || 'none',
    notes: deliveryChallan.notes,
  };
}

function createEmptyLineItem(): LineItem {
  return {
    id: Date.now().toString(),
    description: '',
    itemCode: '',
    hsn: '',
    quantity: 0,
    unit: 'PCS',
    rate: 0,
    amount: 0,
    gst: 0,
    total: 0,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

function amountInWords(value: number): string {
  if (value === 0) return 'Zero Rupees Only';
  return `${formatCurrency(value)} Only`;
}

function FormSection({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <section className={sectionClass}>
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-normal text-slate-600">
        {title}
      </h3>
      {children}
      {note ? <p className="mt-2 text-[10px] text-slate-500">{note}</p> : null}
    </section>
  );
}

function FormHeader({ isNew, onCancel }: { isNew: boolean; onCancel: () => void }) {
  return (
    <div className="border-b border-slate-200 bg-white px-7 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[18px] font-semibold leading-7 text-slate-950">
            {isNew ? 'New Delivery Challan' : 'Edit Delivery Challan'}
          </h1>
          <p className="text-sm leading-6 text-slate-600">Goods movement document — no GST</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onCancel}
            className="h-11 rounded-lg border-slate-200 bg-white px-5 text-[15px] text-slate-950 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" size="default" className="h-11 rounded-lg px-5 text-[15px]">
            <Plus className="h-4 w-4" />
            {isNew ? 'Save Draft' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TextField({
  id,
  formData,
  onChange,
  className,
  inputClassName,
}: {
  id: string;
  formData: FormValues;
  onChange: (fieldId: string, value: string) => void;
  className?: string;
  inputClassName?: string;
}) {
  const field = findField(id);
  if (!field) return null;
  const isLockedAutoField = field.autoGenerate && field.readOnly;

  return (
    <div className={className}>
      <Label htmlFor={id} className={labelClass}>
        {field.label}
        {field.required ? ' *' : ''}
      </Label>
      <Input
        id={id}
        type={field.type === 'date' ? 'date' : 'text'}
        value={formData[id] || ''}
        onChange={(event) => onChange(id, event.target.value)}
        placeholder={field.placeholder}
        readOnly={field.readOnly}
        className={`${fieldClass} mt-1 ${
          isLockedAutoField
            ? 'cursor-not-allowed text-sm text-slate-400 placeholder:text-slate-400'
            : field.readOnly
              ? 'text-slate-700'
              : ''
        } ${inputClassName ?? ''}`}
      />
    </div>
  );
}

function SelectField({
  id,
  formData,
  onChange,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
}: {
  id: string;
  formData: FormValues;
  onChange: (fieldId: string, value: string) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
}) {
  const field = findField(id);
  if (!field) return null;

  return (
    <div className={className}>
      <Label htmlFor={id} className={labelClass}>
        {field.label}
        {field.required ? ' *' : ''}
      </Label>
      <Select value={formData[id] || ''} onValueChange={(value) => onChange(id, value)}>
        <SelectTrigger
          id={id}
          className={`${fieldClass} mt-1 rounded-sm text-[11px] ${triggerClassName ?? ''}`}
        >
          <SelectValue placeholder={field.placeholder || 'Select'} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {getOptions(field.dataSource).map((option) => (
            <SelectItem key={option.value} value={option.value} className={itemClassName}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DeliveryChallanForm({
  deliveryChallan,
  isNew,
  onSave,
  onCancel,
}: DeliveryChallanFormProps) {
  const [formData, setFormData] = useState<FormValues>(() =>
    generateInitialFormValues(deliveryChallan),
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    deliveryChallan?.lineItems?.length ? deliveryChallan.lineItems : [createEmptyLineItem()],
  );

  const totals = useMemo(() => {
    const totalQuantity = lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return { totalQuantity, grandTotal };
  }, [lineItems]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value };

      if (fieldId === 'select_buyer') {
        const buyer = getOptions('domesticBuyers').find((option) => option.value === value);
        next.buyer_name = buyer?.name || '';
        next.buyer_gstin = buyer?.gstin || '';
        next.buyer_address = buyer?.address || '';
        next.buyer_state = buyer?.state || '';
        next.place_delivery = buyer?.placeOfDelivery || '';
      }

      return next;
    });
  };

  const handleAddRow = () => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  };

  const handleRemoveRow = (id: string) => {
    setLineItems((prev) =>
      prev.length === 1 ? [createEmptyLineItem()] : prev.filter((item) => item.id !== id),
    );
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        const quantity = Number(updated.quantity || 0);
        const rate = Number(updated.rate || 0);
        updated.amount = quantity * rate;
        updated.total = updated.amount;

        return updated;
      }),
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.dc_date || !formData.buyer_name) {
      toast.error('Please fill in DC Date and Buyer Name');
      return;
    }

    const validItems = lineItems.filter(
      (item) => item.description && item.description.trim() !== '',
    );
    if (validItems.length === 0) {
      toast.error('Items required', {
        description: 'Add at least one item with a description.',
      });
      return;
    }

    const deliveryChallanData: DeliveryChallan = {
      id: deliveryChallan?.id || Date.now().toString(),
      challanNumber: formData.dc_number || generateChallanNumber(),
      challanDate: formData.dc_date,
      deliveryDate: formData.expected_delivery_date || '',
      status: deliveryChallan?.status || 'draft',
      deliveryType: formData.delivery_type || 'supply_of_goods',
      companyName: formData.company_name || typedFormConfig.sellerProfile.companyName,
      gstin: typedFormConfig.sellerProfile.gstin,
      state: typedFormConfig.sellerProfile.state,
      customerId: formData.select_buyer || '',
      customerName: formData.buyer_name,
      customerGstin: formData.buyer_gstin || '',
      buyerAddress: formData.buyer_address || '',
      placeOfSupply: formData.place_delivery || formData.buyer_state || 'MH',
      reference: formData.linked_invoice_id === 'none' ? '' : formData.linked_invoice_id || '',
      notes: formData.notes || '',
      exchangeRate: 1,
      lineItems,
      subtotal: totals.grandTotal,
      discount: 0,
      taxableAmount: totals.grandTotal,
      totalTax: 0,
      grandTotal: totals.grandTotal,
    };

    onSave(deliveryChallanData);
    toast.success(isNew ? 'Delivery challan created' : 'Delivery challan saved');
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
      <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden bg-white">
        <div className="sticky top-0 z-20 bg-white">
          <FormHeader isNew={isNew} onCancel={onCancel} />
        </div>

        <div className="flex-1 overflow-y-auto bg-white px-7 py-5">
          <div className="mx-auto max-w-[760px] space-y-3 pb-16">
            <FormSection title="HEADER">
              <div className="grid grid-cols-3 gap-3">
                <TextField
                  id="dc_number"
                  formData={formData}
                  onChange={handleFieldChange}
                  inputClassName="bg-white"
                />
                <TextField id="dc_date" formData={formData} onChange={handleFieldChange} />
                <SelectField
                  id="delivery_type"
                  formData={formData}
                  onChange={handleFieldChange}
                  triggerClassName="h-[41px] rounded-lg border-slate-200 bg-white px-3 text-sm font-normal text-slate-950"
                  contentClassName="rounded-xl border-slate-200 bg-white p-1 shadow-lg"
                  itemClassName="rounded-lg py-2.5 pl-9 pr-4 text-sm font-normal text-slate-950 focus:bg-slate-100 focus:text-slate-950"
                />
              </div>
            </FormSection>

            <FormSection title="FROM (YOUR COMPANY)">
              <div className="flex min-h-[41px] items-center rounded-lg bg-white px-3 text-sm font-medium text-slate-950">
                {formData.company_name || typedFormConfig.sellerProfile.companyName}
              </div>
            </FormSection>

            <FormSection title="TO (BUYER)">
              <div className="space-y-3">
                <SelectField id="select_buyer" formData={formData} onChange={handleFieldChange} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField id="buyer_name" formData={formData} onChange={handleFieldChange} />
                  <TextField id="buyer_gstin" formData={formData} onChange={handleFieldChange} />
                  <TextField id="buyer_address" formData={formData} onChange={handleFieldChange} />
                  <TextField id="buyer_state" formData={formData} onChange={handleFieldChange} />
                </div>
                <TextField id="place_delivery" formData={formData} onChange={handleFieldChange} />
              </div>
            </FormSection>

            <FormSection title="TRANSPORT DETAILS (OPTIONAL)">
              <div className="grid grid-cols-3 gap-3">
                <TextField id="transporter_name" formData={formData} onChange={handleFieldChange} />
                <TextField id="vehicle_number" formData={formData} onChange={handleFieldChange} />
                <TextField
                  id="expected_delivery_date"
                  formData={formData}
                  onChange={handleFieldChange}
                />
              </div>
            </FormSection>

            <FormSection
              title="LINKED INVOICE (OPTIONAL)"
              note="Optional reference link. Select an invoice to also copy its line items."
            >
              <SelectField
                id="linked_invoice_id"
                formData={formData}
                onChange={handleFieldChange}
              />
            </FormSection>

            <FormSection title="ITEMS">
              <div className="overflow-x-auto rounded-sm border border-slate-200">
                <div className="grid min-w-[700px] grid-cols-[32px_1.8fr_1fr_1fr_64px_84px_88px_96px_32px] bg-white text-[10px] font-semibold text-slate-950">
                  <div className="border-r border-slate-200 px-2 py-2">#</div>
                  <div className="border-r border-slate-200 px-2 py-2">Description *</div>
                  <div className="border-r border-slate-200 px-2 py-2">Item Code</div>
                  <div className="border-r border-slate-200 px-2 py-2">HSN</div>
                  <div className="border-r border-slate-200 px-2 py-2">Qty</div>
                  <div className="border-r border-slate-200 px-2 py-2">Unit</div>
                  <div className="border-r border-slate-200 px-2 py-2">Rate</div>
                  <div className="border-r border-slate-200 px-2 py-2">Amount</div>
                  <div className="px-2 py-2" />
                </div>

                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid min-w-[700px] grid-cols-[32px_1.8fr_1fr_1fr_64px_84px_88px_96px_32px] border-t border-slate-200 text-[11px]"
                  >
                    <div className="border-r border-slate-200 px-2 py-1.5 text-slate-600">
                      {index + 1}
                    </div>
                    <div className="border-r border-slate-200 p-1">
                      <Input
                        value={item.description}
                        onChange={(event) =>
                          handleLineItemChange(item.id, 'description', event.target.value)
                        }
                        placeholder="Description"
                        className="h-7 rounded-sm border-0 bg-white px-1 text-[11px] shadow-none focus-visible:ring-1"
                      />
                    </div>
                    <div className="border-r border-slate-200 p-1">
                      <Input
                        value={item.itemCode}
                        onChange={(event) =>
                          handleLineItemChange(item.id, 'itemCode', event.target.value)
                        }
                        placeholder="Code"
                        className="h-7 rounded-sm border-0 bg-white px-1 text-[11px] shadow-none focus-visible:ring-1"
                      />
                    </div>
                    <div className="border-r border-slate-200 p-1">
                      <Input
                        value={item.hsn}
                        onChange={(event) =>
                          handleLineItemChange(item.id, 'hsn', event.target.value)
                        }
                        placeholder="HSN"
                        className="h-7 rounded-sm border-0 bg-white px-1 text-[11px] shadow-none focus-visible:ring-1"
                      />
                    </div>
                    <div className="border-r border-slate-200 p-1">
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(event) =>
                          handleLineItemChange(item.id, 'quantity', Number(event.target.value))
                        }
                        className="h-7 rounded-sm border-0 bg-white px-1 text-[11px] shadow-none focus-visible:ring-1"
                      />
                    </div>
                    <div className="border-r border-slate-200 p-1">
                      <Select
                        value={item.unit}
                        onValueChange={(value) => handleLineItemChange(item.id, 'unit', value)}
                      >
                        <SelectTrigger className="h-7 rounded-sm border-0 bg-white px-1 text-[11px] shadow-none focus:ring-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOptions('units').map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-r border-slate-200 p-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(event) =>
                          handleLineItemChange(item.id, 'rate', Number(event.target.value))
                        }
                        className="h-7 rounded-sm border-0 bg-white px-1 text-right text-[11px] shadow-none focus-visible:ring-1"
                      />
                    </div>
                    <div className="border-r border-slate-200 px-2 py-2 text-right">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="flex items-center justify-center py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remove row"
                        className="h-6 w-6 rounded-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveRow(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddRow}
                className="mt-2 h-7 rounded-sm border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </Button>
            </FormSection>

            <FormSection title="SUMMARY">
              <div className="ml-auto w-full max-w-[260px] space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Quantity:</span>
                  <span className="font-semibold text-slate-950">
                    {totals.totalQuantity.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-950">Grand Total:</span>
                  <span className="font-semibold text-slate-950">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
                <p className="text-right text-[10px] text-slate-500">
                  {amountInWords(totals.grandTotal)}
                </p>
              </div>
            </FormSection>

            <FormSection title="NOTES (OPTIONAL)">
              <Textarea
                value={formData.notes || ''}
                onChange={(event) => handleFieldChange('notes', event.target.value)}
                placeholder={findField('notes')?.placeholder}
                className="min-h-16 rounded-sm border-slate-200 bg-white px-2 py-2 text-[11px] shadow-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500/20"
              />
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  );
}
