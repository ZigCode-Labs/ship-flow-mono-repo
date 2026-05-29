'use client';

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  MessageSquare,
  Package,
  Paperclip,
  Plus,
  Save,
  Search,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import {
  type RMLineItem,
  type RMPurchaseOrderFormValues,
  rmPurchaseOrderFormSchema,
} from './types';
import lineItemFields from './line-item-fields.json';

const suppliers: Array<{
  value: string;
  label: string;
  gstin?: string;
  address?: string;
}> = [];

const currencies = ['INR', 'USD', 'EUR', 'GBP'] as const;

const emptyLineItems: RMLineItem[] = [];

type LineItemFieldId = keyof Pick<
  RMLineItem,
  | 'itemCode'
  | 'itemName'
  | 'hsn'
  | 'quantity'
  | 'unit'
  | 'rate'
  | 'discount'
  | 'gst'
  | 'amount'
  | 'lineNote'
>;

interface LineItemFieldConfig {
  id: LineItemFieldId;
  label: string;
  type: 'text' | 'number' | 'select' | 'computed';
  placeholder?: string;
  width: string;
  align?: 'left' | 'right';
  options?: Array<{ value: string; label: string }>;
}

const typedLineItemFields = lineItemFields as LineItemFieldConfig[];

type SearchableOption = {
  value: string;
  label: string;
};

const fieldClassName =
  'h-8 rounded-[4px] border-slate-300 bg-white px-2 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-blue-500/20';

const textareaClassName =
  'min-h-0 rounded-[4px] border-slate-300 bg-white px-2 py-1.5 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-blue-500/20';

const labelClassName = 'text-[10px] font-semibold leading-4 text-slate-900';

const generateLineId = (): string =>
  `rm_item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function FormSection({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn('rounded-[5px] border border-slate-300 bg-white text-slate-950', className)}
    >
      <div className="flex items-center gap-1.5 px-4 pb-2 pt-4">
        <span className="text-slate-700">{icon}</span>
        <h2 className="text-[11px] font-semibold leading-none">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label className={labelClassName}>{label}</Label>
      {children}
    </div>
  );
}

function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Search...',
  emptyMessage = 'Not found',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-8 w-full items-center justify-between rounded-[5px] border border-slate-300 bg-white px-2 text-left text-xs text-slate-900 shadow-none transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          className,
        )}
      >
        <span className={cn('truncate', !value && 'text-slate-500')}>{selectedLabel}</span>
        <ChevronDown className="size-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[210px] overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <div className="flex h-8 items-center gap-2 rounded-[5px] bg-slate-50 px-2">
              <Search className="size-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="max-h-44 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">{emptyMessage}</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearch('');
                    setOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-xs text-slate-900 hover:bg-slate-50"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LineItemsSection({
  lineItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: {
  lineItems: RMLineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, fieldId: LineItemFieldId, value: string | number) => void;
}) {
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const gridTemplateColumns = `${typedLineItemFields
    .map((field) => field.width)
    .join(' ')} 34px 34px`;

  const renderField = (item: RMLineItem, field: LineItemFieldConfig): React.ReactNode => {
    const value = item[field.id];
    const sharedClassName = cn(
      'h-8 rounded-[5px] border-slate-300 bg-white px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-blue-500/20',
      field.align === 'right' && 'text-right',
    );

    if (field.type === 'computed') {
      return (
        <div className="flex h-8 items-center justify-end px-2 text-xs font-semibold text-slate-950">
          {Number(value).toFixed(2)}
        </div>
      );
    }

    if (field.type === 'select') {
      if (field.id === 'itemCode') {
        return (
          <SearchableDropdown
            value={String(value)}
            onChange={(newValue) => onUpdateItem(item.id, field.id, newValue)}
            options={[]}
            placeholder={field.placeholder ?? 'Select'}
            emptyMessage="Not found"
            className="h-8"
          />
        );
      }

      return (
        <Select
          value={String(value)}
          onValueChange={(newValue) =>
            onUpdateItem(item.id, field.id, field.id === 'gst' ? Number(newValue) : newValue)
          }
        >
          <SelectTrigger className={sharedClassName}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={field.type === 'number' ? 'text' : field.type}
        inputMode={field.type === 'number' ? 'decimal' : undefined}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) =>
          onUpdateItem(
            item.id,
            field.id,
            field.type === 'number' ? Number(event.target.value) : event.target.value,
          )
        }
        className={sharedClassName}
      />
    );
  };

  return (
    <section className="overflow-hidden rounded-[5px] border border-slate-300 bg-white">
      <div className="flex h-[54px] items-center justify-between border-b border-slate-200 px-6">
        <h2 className="text-sm font-semibold text-slate-950">Line Items</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="h-9 gap-2 rounded-[5px] border-slate-300 px-4 text-sm font-semibold text-slate-900"
        >
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>

      {lineItems.length === 0 ? (
        <div className="flex h-16 items-center justify-center text-xs text-slate-400">
          No items added. Click &quot;Add Item&quot; to add line items.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div
              className="grid h-9 items-center border-b border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500"
              style={{ gridTemplateColumns }}
            >
              {typedLineItemFields.map((field) => (
                <div key={field.id} className={cn('px-1', field.align === 'right' && 'text-right')}>
                  {field.label}
                </div>
              ))}
              <div />
              <div />
            </div>

            <div className="divide-y divide-slate-100">
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center px-2 py-2"
                  style={{ gridTemplateColumns }}
                >
                  {typedLineItemFields.map((field) => (
                    <div key={field.id} className="px-1">
                      {renderField(item, field)}
                    </div>
                  ))}
                  <div className="flex justify-center px-1">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setOpenNoteId((current) => (current === item.id ? null : item.id))
                        }
                        className="size-8 rounded-[5px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Line notes"
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                      {openNoteId === item.id ? (
                        <div className="absolute right-0 top-9 z-40 w-[300px] rounded-[5px] border border-slate-200 bg-white p-3 text-left shadow-lg">
                          <p className="mb-2 text-sm font-semibold text-slate-600">Line Notes</p>
                          <Textarea
                            value={item.lineNote}
                            onChange={(event) =>
                              onUpdateItem(item.id, 'lineNote', event.target.value)
                            }
                            className="h-28 resize-y rounded-[8px] border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex justify-center px-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveItem(item.id)}
                      className="size-8 rounded-[5px] text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete line item"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TotalsSection({
  subtotal,
  discountAmount,
  taxableAmount,
  totalTax,
  additionalCharges,
  onAdditionalChargesChange,
}: {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  totalTax: number;
  additionalCharges: number;
  onAdditionalChargesChange: (value: number) => void;
}) {
  const grandTotal = taxableAmount + totalTax + additionalCharges;
  const discountPercent = subtotal === 0 ? 0 : (discountAmount / subtotal) * 100;
  const hasDiscount = discountAmount > 0;

  return (
    <section className="rounded-[5px] border border-slate-300 bg-white px-5 py-5">
      <div className="ml-auto w-full max-w-[360px] space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal:</span>
          <span className="text-slate-950">{subtotal.toFixed(2)}</span>
        </div>
        {hasDiscount ? (
          <>
            <div className="flex justify-between text-red-500">
              <span>Discount ({discountPercent.toFixed(2)}%):</span>
              <span>-{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Taxable Amount:</span>
              <span className="text-slate-950">{taxableAmount.toFixed(2)}</span>
            </div>
          </>
        ) : null}
        <div className="flex justify-between">
          <span className="text-slate-600">IGST:</span>
          <span className="text-slate-950">{totalTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Total Tax:</span>
          <span className="text-slate-950">{totalTax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Additional Charges:</span>
          <Input
            type="number"
            value={additionalCharges}
            onChange={(event) => onAdditionalChargesChange(Number(event.target.value))}
            className="h-8 w-36 rounded-[5px] border-slate-300 bg-white px-3 text-right text-sm"
          />
        </div>
        <div className="flex justify-between border-t border-slate-300 pt-4 text-lg">
          <span className="font-bold text-slate-950">Grand Total:</span>
          <span className="font-bold text-emerald-600">{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
}

export function RMPurchaseOrderForm({
  poNumber,
  onBack,
  onSave,
}: {
  poNumber: string;
  onBack: () => void;
  onSave: (values: RMPurchaseOrderFormValues) => void;
}) {
  const [lineItems, setLineItems] = useState<RMLineItem[]>(emptyLineItems);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, setValue } = useForm<RMPurchaseOrderFormValues>({
    resolver: zodResolver(rmPurchaseOrderFormSchema),
    defaultValues: {
      poNumber,
      poContext: 'Domestic Purchase',
      issueDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      supplier: '',
      supplierGstin: '',
      supplierAddress: '',
      deliveryLocation: '',
      currency: 'INR',
      paymentTerms: '',
      shipToAddress: '',
      notes: '',
      internalNotes: '',
      additionalCharges: 0,
      lineItems: [],
    },
  });

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const discountAmount = lineItems.reduce(
      (sum, item) => sum + (item.quantity * item.rate * item.discount) / 100,
      0,
    );
    const taxableAmount = subtotal - discountAmount;
    const totalTax = lineItems.reduce((sum, item) => sum + (item.amount * item.gst) / 100, 0);

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      totalTax,
    };
  }, [lineItems]);

  const handleSupplierChange = (value: string): void => {
    const supplier = suppliers.find((item) => item.value === value);

    setValue('supplier', value);
    setValue('supplierGstin', supplier?.gstin ?? '');
    setValue('supplierAddress', supplier?.address ?? '');
  };

  const handleAddItem = (): void => {
    setLineItems((current) => [
      ...current,
      {
        id: generateLineId(),
        itemCode: '',
        itemName: '',
        hsn: '',
        quantity: 1,
        unit: 'PC',
        rate: 0,
        discount: 0,
        gst: 0,
        amount: 0,
        total: 0,
        lineNote: '',
      },
    ]);
  };

  const calculateLineItemTotals = (item: RMLineItem): RMLineItem => {
    const grossAmount = item.quantity * item.rate;
    const discountAmount = (grossAmount * item.discount) / 100;
    const amount = grossAmount - discountAmount;
    const total = amount + (amount * item.gst) / 100;

    return {
      ...item,
      amount,
      total,
    };
  };

  const handleUpdateItem = (id: string, fieldId: LineItemFieldId, value: string | number): void => {
    setLineItems((current) =>
      current.map((item) =>
        item.id === id ? calculateLineItemTotals({ ...item, [fieldId]: value }) : item,
      ),
    );
  };

  const handleRemoveItem = (id: string): void => {
    setLineItems((current) => current.filter((item) => item.id !== id));
  };

  const handleAdditionalChargesChange = (value: number): void => {
    setAdditionalCharges(value);
    setValue('additionalCharges', value);
  };

  const handleValidSubmit = (values: RMPurchaseOrderFormValues): void => {
    if (lineItems.length === 0) {
      toast.error('Error', {
        description: 'Add at least one line item',
        position: 'bottom-right',
        classNames: {
          title: '!text-red-950',
          description: '!text-red-800',
        },
      });
      return;
    }

    onSave({
      ...values,
      lineItems,
      additionalCharges,
    });
  };

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      setAttachments((current) => [...current, ...files]);
    }

    event.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="flex h-full flex-col bg-slate-50">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onBack}
            className="h-7 gap-1 rounded-[4px] px-2 text-[11px] text-slate-700"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <div className="flex items-center gap-1.5">
            <ShoppingCartIcon />
            <span className="text-[11px] font-semibold text-slate-950">New Purchase Order</span>
          </div>
        </div>
        <Button
          type="submit"
          size="xs"
          className="h-7 gap-1 rounded-[4px] bg-emerald-600 px-3 text-[10px] font-semibold text-white hover:bg-emerald-700"
        >
          <Save className="size-3" />
          Save PO
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3">
          <FormSection icon={<Package className="size-3.5" />} title="PO Details">
            <div className="grid grid-cols-1 gap-3 px-4 pb-4 md:grid-cols-2">
              <Controller
                name="poNumber"
                control={control}
                render={({ field }) => (
                  <TextField label="PO Number">
                    <Input {...field} readOnly className={cn(fieldClassName, 'bg-slate-50')} />
                  </TextField>
                )}
              />
              <Controller
                name="poContext"
                control={control}
                render={({ field }) => (
                  <TextField label="PO Context">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Domestic Purchase">Domestic Purchase</SelectItem>
                        <SelectItem value="Import Purchase">Import Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </TextField>
                )}
              />
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => (
                  <TextField label="Issue Date">
                    <Input {...field} type="date" className={fieldClassName} />
                  </TextField>
                )}
              />
              <Controller
                name="expectedDeliveryDate"
                control={control}
                render={({ field }) => (
                  <TextField label="Expected Delivery Date">
                    <Input {...field} type="date" className={fieldClassName} />
                  </TextField>
                )}
              />
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <TextField label="Supplier">
                    <SearchableDropdown
                      value={field.value}
                      onChange={handleSupplierChange}
                      options={[]}
                      placeholder="Select a supplier"
                      emptyMessage="Not found"
                      className={fieldClassName}
                    />
                  </TextField>
                )}
              />
              <Controller
                name="supplierGstin"
                control={control}
                render={({ field }) => (
                  <TextField label="Supplier GSTIN">
                    <Input {...field} className={fieldClassName} />
                  </TextField>
                )}
              />
              <Controller
                name="supplierAddress"
                control={control}
                render={({ field }) => (
                  <TextField label="Supplier Address" className="md:col-span-2">
                    <Textarea
                      {...field}
                      rows={3}
                      className={cn(textareaClassName, 'h-14 resize-y')}
                    />
                  </TextField>
                )}
              />
              <Controller
                name="deliveryLocation"
                control={control}
                render={({ field }) => (
                  <TextField label="Delivery Location">
                    <SearchableDropdown
                      value={field.value}
                      onChange={field.onChange}
                      options={[]}
                      placeholder="Select location"
                      emptyMessage="Not found"
                      className={fieldClassName}
                    />
                  </TextField>
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <TextField label="Currency">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TextField>
                )}
              />
              <Controller
                name="paymentTerms"
                control={control}
                render={({ field }) => (
                  <TextField label="Payment Terms">
                    <Input {...field} placeholder="e.g., Net 30 days" className={fieldClassName} />
                  </TextField>
                )}
              />
              <Controller
                name="shipToAddress"
                control={control}
                render={({ field }) => (
                  <TextField label="Ship To Address" className="md:col-span-2">
                    <Textarea
                      {...field}
                      placeholder="Delivery address..."
                      rows={2}
                      className={cn(textareaClassName, 'h-12 resize-y')}
                    />
                  </TextField>
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField label="Notes (prints on PO)" className="md:col-span-2">
                    <Textarea
                      {...field}
                      placeholder="Additional notes..."
                      rows={2}
                      className={cn(textareaClassName, 'h-12 resize-y')}
                    />
                  </TextField>
                )}
              />
              <Controller
                name="internalNotes"
                control={control}
                render={({ field }) => (
                  <TextField label="Internal Notes" className="md:col-span-2">
                    <Textarea
                      {...field}
                      placeholder="Internal notes (will not appear on the PO)..."
                      rows={2}
                      className={cn(textareaClassName, 'h-12 resize-y')}
                    />
                    <p className="text-[9px] text-slate-400">
                      These notes will not appear on the printed PO.
                    </p>
                  </TextField>
                )}
              />
            </div>
          </FormSection>

          <FormSection
            icon={<Paperclip className="size-3.5" />}
            title="Attachments"
            className="px-4 pb-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              aria-label="Select attachment files"
            />
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleUploadClick}
              className="h-7 gap-1.5 rounded-[4px] border-slate-300 px-3 text-[10px] text-slate-800"
            >
              <Upload className="size-3" />
              Upload File
            </Button>
            <p className="mt-1 text-[9px] text-slate-500">
              Quotation, email confirmation, drawings, etc.
            </p>
            {attachments.length > 0 ? (
              <div className="mt-3 space-y-1">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-[4px] border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="ml-2 shrink-0 text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </FormSection>

          <LineItemsSection
            lineItems={lineItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItem={handleUpdateItem}
          />

          <TotalsSection
            subtotal={totals.subtotal}
            discountAmount={totals.discountAmount}
            taxableAmount={totals.taxableAmount}
            totalTax={totals.totalTax}
            additionalCharges={additionalCharges}
            onAdditionalChargesChange={handleAdditionalChargesChange}
          />
        </div>
      </div>
    </form>
  );
}

function ShoppingCartIcon() {
  return <FileText className="size-3.5 text-emerald-600" />;
}
