'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Package,
  FileText,
  Upload,
  ChevronDown,
  Paperclip,
  X,
  File,
  MessageSquare,
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
  type LineItem,
  type ComputedValues,
} from '../types/form';
import type { PurchaseOrderFormConfig } from '../types/form';
import poFormConfig from '../data/po-form-config.json';

interface PurchaseOrderFormProps {
  initialData?: Partial<PurchaseOrderFormValues>;
  onSave?: (data: PurchaseOrderFormValues) => void;
  onCancel?: () => void;
}

const typedFormConfig = poFormConfig as PurchaseOrderFormConfig;
const fieldRadiusClass = 'rounded-lg';

// Generate PO Number
function generatePONumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const sequence = '00001';
  return `PO-${year}-${sequence}`;
}

// Generate unique ID
function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Searchable Select Component
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400">No items found</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex w-full items-center px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Line Items Section
function LineItemsSection({
  lineItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  currency,
}: {
  lineItems: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void;
  currency: string;
}) {
  const gstOptions = typedFormConfig.dataSources.gstRates;

  // SINGLE shared grid template - EXACT SAME for header, body, and empty state
  const GRID_TEMPLATE = '130px 240px 100px 80px 80px 100px 80px 90px 140px 70px';

  // Input styling - compact ERP appearance
  const inputClassName =
    'h-[40px] w-full rounded-[10px] border border-gray-200 bg-white px-2 text-sm box-border focus-visible:ring-1 focus-visible:ring-blue-500/30';

  // Select styling - compact ERP appearance
  const selectTriggerClassName =
    'h-[40px] w-full rounded-[10px] border border-gray-200 bg-white px-2 text-sm box-border focus:ring-1 focus:ring-blue-500/30';

  // Header cell styling
  const headerCellClass = 'text-[14px] font-medium text-gray-600 px-2 flex items-center';

  // Body cell styling
  const bodyCellClass = 'px-1 flex items-center';

  return (
    <div className="w-full rounded-[16px] border border-gray-200 bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex flex-row items-center justify-between px-6 py-4 pb-3">
        <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="h-9 gap-1.5 rounded-lg border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Table Wrapper - ONLY this scrolls horizontally */}
      <div className="overflow-x-auto overflow-y-hidden w-full">
        {/* Table Inner - Fixed min-width, moves together as one unit */}
        <div style={{ minWidth: '1200px' }}>
          {/* Header Row - Uses SAME grid template */}
          <div
            className="grid border-b border-gray-200 bg-gray-50"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            <div className={`${headerCellClass} justify-start`}>Item Code</div>
            <div className={`${headerCellClass} justify-start`}>Item Name</div>
            <div className={`${headerCellClass} justify-start`}>HSN</div>
            <div className={`${headerCellClass} justify-center`}>Qty</div>
            <div className={`${headerCellClass} justify-center`}>Unit</div>
            <div className={`${headerCellClass} justify-center`}>Rate</div>
            <div className={`${headerCellClass} justify-center`}>Disc%</div>
            <div className={`${headerCellClass} justify-center`}>GST%</div>
            <div className={`${headerCellClass} justify-end`}>Amount</div>
            <div className={`${headerCellClass} justify-center`}></div>
          </div>

          {/* Body Rows Container */}
          <div className="divide-y divide-gray-100">
            {!lineItems || lineItems.length === 0 ? (
              /* Empty State - Uses SAME grid template for alignment */
              <div className="grid items-center" style={{ gridTemplateColumns: GRID_TEMPLATE }}>
                <div className="col-span-10 px-3 py-10">
                  <span className="text-sm text-gray-400">
                    No items added. Click &quot;Add Item&quot; to add line items.
                  </span>
                </div>
              </div>
            ) : (
              lineItems.map((item) => (
                /* Data Row - Uses SAME grid template */
                <div
                  key={item.id}
                  className="grid items-center hover:bg-gray-50/50"
                  style={{ gridTemplateColumns: GRID_TEMPLATE }}
                >
                  {/* Item Code */}
                  <div className={bodyCellClass}>
                    <Select
                      value={item.itemCode}
                      onValueChange={(value) => onUpdateItem(item.id, 'itemCode', value)}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ITEM001">ITEM001</SelectItem>
                        <SelectItem value="ITEM002">ITEM002</SelectItem>
                        <SelectItem value="ITEM003">ITEM003</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Item Name */}
                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => onUpdateItem(item.id, 'itemName', e.target.value)}
                      placeholder="Item name"
                      className={inputClassName}
                    />
                  </div>

                  {/* HSN */}
                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => onUpdateItem(item.id, 'hsn', e.target.value)}
                      placeholder="HSN"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Qty */}
                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Unit */}
                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={item.unit}
                      onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                      placeholder="PC"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Rate */}
                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => onUpdateItem(item.id, 'rate', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Disc% */}
                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={item.discount}
                      onChange={(e) => onUpdateItem(item.id, 'discount', Number(e.target.value))}
                      min="0"
                      max="100"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* GST% */}
                  <div className={bodyCellClass}>
                    <Select
                      value={item.gst.toString()}
                      onValueChange={(value) => onUpdateItem(item.id, 'gst', Number(value))}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gstOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className={`${bodyCellClass} justify-end gap-2`}>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.amount.toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-[8px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className={`${bodyCellClass} justify-center`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-7 w-7 rounded-[8px] text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Totals Section
function TotalsSection({
  computedValues,
  onAdditionalChargesChange,
  currency,
}: {
  computedValues: ComputedValues;
  onAdditionalChargesChange: (val: number) => void;
  currency: string;
}) {
  return (
    <Card className="border rounded-xl">
      <CardContent className="pt-4 pb-4">
        <div className="max-w-sm ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">{computedValues.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IGST:</span>
            <span className="text-gray-900">{computedValues.igst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Tax:</span>
            <span className="text-gray-900">{computedValues.totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-600">Additional Charges:</span>
            <Input
              type="number"
              value={computedValues.additionalCharges}
              onChange={(e) => onAdditionalChargesChange(Number(e.target.value))}
              className="w-24 h-7 text-right rounded-md"
              step="0.01"
            />
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold text-gray-900">Grand Total:</span>
            <span className="font-semibold text-emerald-600">
              {computedValues.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Form Component
export function PurchaseOrderForm({ initialData, onSave, onCancel }: PurchaseOrderFormProps) {
  const router = useRouter();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      poNumber: generatePONumber(),
      poContext: 'Domestic Purchase' as const,
      issueDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      supplier: '',
      supplierGstin: '',
      supplierAddress: '',
      deliveryLocation: '',
      currency: 'INR' as const,
      paymentTerms: '',
      shipToAddress: '',
      notes: '',
      internalNotes: '',
      additionalCharges: 0,
      lineItems: [],
      ...initialData,
    },
  });

  const currency = watch('currency');
  const selectedSupplier = watch('supplier');

  // Auto-fill supplier details when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      const supplier = typedFormConfig.dataSources.suppliers.find(
        (s) => s.value === selectedSupplier,
      );
      if (supplier) {
        setValue('supplierGstin', supplier.gstin || '');
        setValue('supplierAddress', supplier.address || '');
      }
    }
  }, [selectedSupplier, setValue]);

  // Computed values
  const computedValues: ComputedValues = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const igst = lineItems.reduce((sum, item) => sum + (item.amount * item.gst) / 100, 0);
    const totalTax = igst;
    const grandTotal = subtotal + totalTax + additionalCharges;

    return {
      subtotal,
      igst,
      totalTax,
      additionalCharges,
      grandTotal,
    };
  }, [lineItems, additionalCharges]);

  // Line item handlers
  const handleAddItem = useCallback(() => {
    const newItem: LineItem = {
      id: generateId(),
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
    };
    setLineItems((prev) => [...prev, newItem]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          const updated = { ...item, [field]: value };

          // Recalculate amount and total
          if (field === 'quantity' || field === 'rate' || field === 'discount') {
            const grossAmount = updated.quantity * updated.rate;
            const discountAmount = (grossAmount * updated.discount) / 100;
            updated.amount = grossAmount - discountAmount;
            updated.total = updated.amount + (updated.amount * updated.gst) / 100;
          }

          if (field === 'gst') {
            updated.total = updated.amount + (updated.amount * updated.gst) / 100;
          }

          return updated;
        }),
      );
    },
    [],
  );

  const handleAdditionalChargesChange = useCallback(
    (val: number) => {
      setAdditionalCharges(val);
      setValue('additionalCharges', val);
    },
    [setValue],
  );

  // File upload handlers
  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachments((prev) => [...prev, ...Array.from(files)]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
    // Reset input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  }, []);

  const handleFormSubmit = (data: PurchaseOrderFormValues) => {
    const formData: PurchaseOrderFormValues = {
      ...data,
      lineItems,
      additionalCharges,
    };

    if (onSave) {
      onSave(formData);
    }

    toast.success('Purchase Order saved successfully!');
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const getDataSourceOptions = (dataSource: string) => {
    return (
      typedFormConfig.dataSources[dataSource as keyof typeof typedFormConfig.dataSources] || []
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">New Purchase Order</h1>
          </div>
        </div>
        <Button
          type="submit"
          className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <FileText className="h-4 w-4" />
          Save PO
        </Button>
      </div>

      {/* PO Details Card */}
      <Card className="border rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium text-gray-800">PO Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PO Number */}
            <div className="space-y-1.5">
              <Label htmlFor="poNumber" className="text-sm text-gray-600">
                PO Number
              </Label>
              <Controller
                name="poNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="poNumber"
                    readOnly
                    className={`${fieldRadiusClass} bg-gray-50 border-gray-200`}
                  />
                )}
              />
            </div>

            {/* PO Context */}
            <div className="space-y-1.5">
              <Label htmlFor="poContext" className="text-sm text-gray-600">
                PO Context
              </Label>
              <Controller
                name="poContext"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`${fieldRadiusClass} border-gray-200`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getDataSourceOptions('poContexts').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <Label htmlFor="issueDate" className="text-sm text-gray-600">
                Issue Date
              </Label>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="issueDate"
                    type="date"
                    className={`${fieldRadiusClass} border-gray-200`}
                  />
                )}
              />
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-1.5">
              <Label htmlFor="expectedDeliveryDate" className="text-sm text-gray-600">
                Expected Delivery Date
              </Label>
              <Controller
                name="expectedDeliveryDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="expectedDeliveryDate"
                    type="date"
                    className={`${fieldRadiusClass} border-gray-200`}
                  />
                )}
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1.5">
              <Label htmlFor="supplier" className="text-sm text-gray-600">
                Supplier
              </Label>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={getDataSourceOptions('suppliers')}
                    placeholder="Select a supplier"
                  />
                )}
              />
              {errors.supplier && <p className="text-xs text-red-500">{errors.supplier.message}</p>}
            </div>

            {/* Supplier GSTIN */}
            <div className="space-y-1.5">
              <Label htmlFor="supplierGstin" className="text-sm text-gray-600">
                Supplier GSTIN
              </Label>
              <Controller
                name="supplierGstin"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="supplierGstin"
                    placeholder="e.g., 27AABCU9603R1ZM"
                    className={`${fieldRadiusClass} border-gray-200`}
                  />
                )}
              />
            </div>

            {/* Supplier Address */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="supplierAddress" className="text-sm text-gray-600">
                Supplier Address
              </Label>
              <Controller
                name="supplierAddress"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="supplierAddress"
                    placeholder="Enter supplier address"
                    rows={3}
                    className={`${fieldRadiusClass} border-gray-200 resize-none`}
                  />
                )}
              />
            </div>

            {/* Delivery Location */}
            <div className="space-y-1.5">
              <Label htmlFor="deliveryLocation" className="text-sm text-gray-600">
                Delivery Location
              </Label>
              <Controller
                name="deliveryLocation"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={getDataSourceOptions('deliveryLocations')}
                    placeholder="Select location"
                  />
                )}
              />
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-sm text-gray-600">
                Currency
              </Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`${fieldRadiusClass} border-gray-200`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getDataSourceOptions('currencies').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-1.5">
              <Label htmlFor="paymentTerms" className="text-sm text-gray-600">
                Payment Terms
              </Label>
              <Controller
                name="paymentTerms"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="paymentTerms"
                    placeholder="e.g., Net 30 days"
                    className={`${fieldRadiusClass} border-gray-200`}
                  />
                )}
              />
            </div>

            {/* Ship To Address */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="shipToAddress" className="text-sm text-gray-600">
                Ship To Address
              </Label>
              <Controller
                name="shipToAddress"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="shipToAddress"
                    placeholder="Delivery address..."
                    rows={2}
                    className={`${fieldRadiusClass} border-gray-200 resize-none`}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card className="border rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium text-gray-800">Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm text-gray-600">
              Notes (prints on PO)
            </Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="notes"
                  placeholder="Additional notes..."
                  rows={3}
                  className={`${fieldRadiusClass} border-gray-200 resize-none`}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="internalNotes" className="text-sm text-gray-600">
              Internal Notes
            </Label>
            <Controller
              name="internalNotes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="internalNotes"
                  placeholder="Internal notes (will not appear on the PO)..."
                  rows={2}
                  className={`${fieldRadiusClass} border-gray-200 resize-none`}
                />
              )}
            />
            <p className="text-xs text-gray-400">These notes will not appear on the printed PO.</p>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section */}
      <Card className="border rounded-xl bg-white shadow-sm">
        <CardHeader className="px-6 py-4 pb-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium text-gray-800">Attachments</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5 pt-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload files"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFileButtonClick}
            className="h-9 gap-2 rounded-lg border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
          <p className="mt-2 text-xs text-gray-400">
            Quotation, email confirmation, drawings, etc.
          </p>

          {/* File list */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAttachment(index)}
                    className="h-7 w-7 flex-shrink-0 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items Section */}
      <LineItemsSection
        lineItems={lineItems}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateItem={handleUpdateItem}
        currency={currency}
      />

      {/* Totals Section */}
      <TotalsSection
        computedValues={computedValues}
        onAdditionalChargesChange={handleAdditionalChargesChange}
        currency={currency}
      />

      {/* Bottom spacing for comfortable scrolling */}
      <div className="h-8" />
    </form>
  );
}
