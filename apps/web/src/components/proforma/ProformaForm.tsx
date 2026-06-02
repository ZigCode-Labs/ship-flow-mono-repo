'use client';

import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { z } from 'zod';
import { useFieldArray, useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText,
  ArrowRightLeft,
  RefreshCw,
  Plus,
  Lock,
  ArrowLeft,
  Save,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { DEFAULT_EXCHANGE_RATE, getNextExchangeRate } from '@/components/proforma/exchange-rate';

interface ProformaFormProps {
  initialExchangeRate?: string;
  onRefreshExchangeRate?: (nextRate: string) => void;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
  initialData?: any;
}

const lineItemSchema = z.object({
  id: z.string(),
  itemCode: z.string(),
  description: z.string(),
  hsn: z.string(),
  qty: z.number().min(1),
  rate: z.number().min(0),
  gstPercent: z.number().min(0),
});

const lineItemsFormSchema = z.object({
  lineItems: z.array(lineItemSchema),
});

type LineItemFormValues = z.infer<typeof lineItemSchema>;
type LineItemsFormValues = z.infer<typeof lineItemsFormSchema>;

const getNumberValue = (value: number | string | undefined) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getAmount = (item?: Partial<LineItemFormValues>) => {
  const qty = getNumberValue(item?.qty);
  const rate = getNumberValue(item?.rate);
  return qty * rate;
};

const getTotal = (item?: Partial<LineItemFormValues>) => {
  const amount = getAmount(item);
  const gstPercent = getNumberValue(item?.gstPercent);
  return amount + amount * (gstPercent / 100);
};

const getItemGSTAmount = (item?: Partial<LineItemFormValues>) => {
  const amount = getAmount(item);
  const gstPercent = getNumberValue(item?.gstPercent);
  return amount * (gstPercent / 100);
};

const PLACE_OF_SUPPLY_OPTIONS = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
] as const;

const GST_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
] as const;

const createLineItem = (): LineItemFormValues =>
  lineItemSchema.parse({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemCode: '',
    description: '',
    hsn: '',
    qty: 1,
    rate: 0,
    gstPercent: 18,
  });

export function ProformaForm({
  initialExchangeRate = DEFAULT_EXCHANGE_RATE,
  onRefreshExchangeRate,
  onCancel,
  onSaveSuccess,
  initialData,
}: ProformaFormProps) {
  const [isRateLocked, setIsRateLocked] = useState(initialData?.isRateLocked ?? false);
  const [exchangeRate, setExchangeRate] = useState(
    initialData?.exchangeRate?.toString() || initialExchangeRate,
  );
  const [isRefreshingExchangeRate, setIsRefreshingExchangeRate] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [discountValue, setDiscountValue] = useState<number>(initialData?.discountValue ?? 0);
  const [discountType, setDiscountType] = useState<'₹' | '%'>(
    (initialData?.discountType as '₹' | '%') ?? '₹',
  );

  const { control, register, setValue, getValues } = useForm<any>({
    defaultValues: initialData
      ? {
          ...initialData,
          date: initialData.date
            ? new Date(initialData.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          validUntil: initialData.validUntil
            ? new Date(initialData.validUntil).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }
      : {
          lineItems: [],
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          proformaNumber: `DPI-${Date.now().toString().slice(-6)}`,
          sellerCompanyName: 'Ship Flow Inc.',
          sellerGstin: '27AADCS1493R1Z4',
          sellerState: 'Maharashtra',
        },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const lineItems = useWatch({
    control,
    name: 'lineItems',
  });

  // Calculate totals for summary card
  const totals = useMemo(() => {
    const subtotal = lineItems?.reduce((sum: number, item) => sum + getAmount(item), 0) || 0;
    const totalGST = lineItems?.reduce((sum: number, item) => sum + getItemGSTAmount(item), 0) || 0;

    let discountAmount = 0;
    if (discountType === '₹') {
      discountAmount = discountValue;
    } else {
      discountAmount = (subtotal * discountValue) / 100;
    }
    discountAmount = Math.min(discountAmount, subtotal); // Cap at subtotal

    const taxableAmount = subtotal - discountAmount;
    const igst = totalGST; // IGST is the total GST amount
    const totalTax = igst;
    const grandTotal = taxableAmount + totalTax;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      igst,
      totalTax,
      grandTotal,
    };
  }, [lineItems, discountValue, discountType]);

  const handleAddItem = () => {
    append(createLineItem());
  };

  const handleSaveProforma = async () => {
    if (fields.length === 0) {
      toast.error('Error', {
        description: 'Add at least one item',
      });
      return;
    }

    try {
      const formValues = getValues();
      const { id, createdAt, updatedAt, ...cleanFormValues } = formValues;

      const payload = {
        ...cleanFormValues,
        customerName: cleanFormValues.customerName || 'Unknown Customer',
        customerGstin: cleanFormValues.customerGstin || 'URP', // Unregistered Person
        placeOfSupply: cleanFormValues.placeOfSupply || '27',
        exchangeRate: Number(exchangeRate) || 1,
        isRateLocked,
        discountValue: Number(discountValue) || 0,
        discountType,
        subtotal: totals.subtotal || 0,
        discountAmount: totals.discountAmount || 0,
        taxableAmount: totals.taxableAmount || 0,
        igst: totals.igst || 0,
        totalTax: totals.totalTax || 0,
        grandTotal: totals.grandTotal || 0,
        date: new Date(cleanFormValues.date || Date.now()).toISOString(),
        validUntil: new Date(cleanFormValues.validUntil || Date.now()).toISOString(),
        lineItems: (cleanFormValues.lineItems || []).map((item: any) => ({
          itemCode: item.itemCode || 'MISC',
          description: item.description || 'Miscellaneous Item',
          hsn: item.hsn || '999999',
          qty: Number(item.qty) || 1,
          rate: Number(item.rate) || 0,
          amount: getAmount(item) || 0,
          gstPercent: Number(item.gstPercent) || 0,
          total: getTotal(item) || 0,
        })),
      };

      const path = initialData?.id
        ? `/domestic-proformas/${initialData.id}`
        : '/domestic-proformas';

      await (initialData?.id ? api.put(path, payload as any) : api.post(path, payload as any));

      toast.success('Success', {
        description: 'Proforma updated successfully',
      });

      // Close form and show card
      onSaveSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error('Error', {
        description: 'Failed to save proforma to backend',
      });
    }
  };

  const handleRefreshExchangeRate = () => {
    if (isRefreshingExchangeRate) {
      return;
    }

    setIsRefreshingExchangeRate(true);

    window.setTimeout(() => {
      const nextRate = getNextExchangeRate(exchangeRate);

      setExchangeRate(nextRate);
      onRefreshExchangeRate?.(nextRate);
      setIsRefreshingExchangeRate(false);
    }, 700);
  };

  return (
    <div className="h-full w-full overflow-auto bg-surface-container-lowest">
      <div className="sticky top-0 z-20 border-b border-outline-variant/30 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-sm text-black hover:text-black cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h1 className="text-lg font-medium text-on-surface">New Domestic Proforma</h1>
            </div>
          </div>
          <Button
            onClick={handleSaveProforma}
            size="lg"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-sm"
          >
            <Save className="h-4 w-4" />
            Save Proforma
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
        {/* Proforma Details Card */}
        <section className="rounded-xl border border-outline-variant/20 bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-black" />
            <h2 className="text-sm font-medium text-on-surface">Proforma Details</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-black">Proforma Number</Label>
              <Input
                {...register('proformaNumber')}
                type="text"
                className="h-[40px] rounded-md border-outline-variant/30 bg-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-black">Date</Label>
              <Input
                {...register('date')}
                type="date"
                className="h-[40px] rounded-md border-outline-variant/30 bg-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-black">Valid Until</Label>
              <Input
                {...register('validUntil')}
                type="date"
                className="h-[40px] rounded-md border-outline-variant/30 bg-white text-sm"
              />
            </div>
          </div>
        </section>

        {/* Exchange Rate Card */}
        <section className="rounded-xl border border-outline-variant/20 bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-black" />
            <h2 className="text-sm font-medium text-on-surface">USD to INR Exchange Rate</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-black">
              <span>1 USD =</span>
              <Input
                type="text"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                readOnly={!isRateLocked}
                aria-readonly={!isRateLocked}
                className="h-7 w-24 rounded-md border-outline-variant/30 text-center text-sm text-black read-only:cursor-not-allowed read-only:bg-muted/50"
              />
              <span className="font-medium text-black">INR</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRateLocked(!isRateLocked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isRateLocked ? 'bg-primary' : 'bg-input'
                }`}
                role="switch"
                aria-checked={isRateLocked}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                    isRateLocked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="flex items-center gap-1 text-xs font-medium text-black">
                <Lock className="h-3 w-3" />
                {isRateLocked ? 'Locked' : 'Live'}
              </span>
            </div>
            {!isRateLocked ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={isRefreshingExchangeRate}
                onClick={handleRefreshExchangeRate}
                className="flex items-center gap-1.5 rounded-[5px]"
              >
                {isRefreshingExchangeRate ? (
                  <Spinner className="h-4 w-4 [animation-duration:700ms] [animation-iteration-count:1]" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            ) : null}
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {isRateLocked
                ? 'Rate Locked - manual entry enabled'
                : 'Live rate from Frankfurter API'}
            </Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Item catalog prices are stored in USD. When you add items, they will be converted to INR
            using this rate.
          </p>
        </section>

        {/* Details Grid - Seller & Customer */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Seller Details */}
          <section className="rounded-xl border border-outline-variant/20 bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-medium text-on-surface">Seller Details</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">Company Name</Label>
                <Input
                  {...register('sellerCompanyName')}
                  type="text"
                  className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">GSTIN</Label>
                <Input
                  {...register('sellerGstin')}
                  type="text"
                  className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">State</Label>
                <Input
                  {...register('sellerState')}
                  type="text"
                  className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
                />
              </div>
            </div>
          </section>

          {/* Customer Details */}
          <section className="rounded-xl border border-outline-variant/20 bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-medium text-on-surface">Customer Details</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">Select Customer</Label>
                <Select>
                  <SelectTrigger className="h-9 border-outline-variant/30 text-sm">
                    <SelectValue placeholder="Select a domestic buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-3 py-2 text-sm text-muted-foreground">No Buyers Found</div>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">Customer Name</Label>
                <Input
                  {...register('customerName')}
                  type="text"
                  className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">Customer GSTIN</Label>
                <Input
                  {...register('customerGstin')}
                  type="text"
                  placeholder="e.g., 27AABCU9603R1ZM"
                  className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-black">Place of Supply</Label>
                <Controller
                  control={control}
                  name="placeOfSupply"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      {' '}
                      <SelectTrigger className="h-9 border-outline-variant/30 text-sm">
                        {' '}
                        <SelectValue placeholder="Select state" />{' '}
                      </SelectTrigger>{' '}
                      <SelectContent className="max-h-[30rem]">
                        {' '}
                        {PLACE_OF_SUPPLY_OPTIONS.map((state) => (
                          <SelectItem key={state.code} value={state.code} className="pl-3 text-xs">
                            {' '}
                            {state.code} - {state.name}{' '}
                          </SelectItem>
                        ))}{' '}
                      </SelectContent>{' '}
                    </Select>
                  )}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Line Items Card */}
        <section className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-on-surface">Line Items</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-y border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-low">
                  <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-black">
                    Item Code
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-black">
                    Description
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-black">
                    HSN
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-black">
                    Qty
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-black">
                    Rate (₹)
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-black">
                    Amount
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-black">
                    GST %
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-black">
                    Total
                  </TableHead>
                  <TableHead className="w-10 px-2 py-2.5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-4 py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No items added. Click &quot;Add Item&quot; to add line items, or select from
                        your Item Register.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => {
                    const currentItem = lineItems?.[index];
                    const amount = getAmount(currentItem);
                    const total = getTotal(currentItem);

                    return (
                      <TableRow key={field.id} className="border-b border-outline-variant/20">
                        <TableCell className="px-2 py-2 align-middle">
                          <Controller
                            control={control}
                            name={`lineItems.${index}.itemCode`}
                            render={({ field: controllerField }) => (
                              <Select
                                value={controllerField.value}
                                onValueChange={controllerField.onChange}
                                onOpenChange={(open) => {
                                  if (open) setItemSearchQuery('');
                                }}
                              >
                                <SelectTrigger className="h-8 min-w-[108px] border-outline-variant/30 bg-white px-2 text-xs">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="px-2 py-2">
                                    <div className="relative">
                                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        placeholder="Search items..."
                                        value={itemSearchQuery}
                                        onChange={(e) => setItemSearchQuery(e.target.value)}
                                        className="h-8 pl-8 text-xs"
                                        onKeyDown={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                  <div className="px-3 py-3 text-center text-sm text-muted-foreground">
                                    No items found
                                  </div>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 align-middle">
                          <Input
                            {...register(`lineItems.${index}.description`)}
                            placeholder="Item description"
                            className="h-8 min-w-[140px] rounded-md border-outline-variant/30 bg-white px-2 text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 align-middle">
                          <Input
                            {...register(`lineItems.${index}.hsn`)}
                            placeholder="HSN"
                            className="h-8 min-w-[84px] rounded-md border-outline-variant/30 bg-white px-2 text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 align-middle">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            {...register(`lineItems.${index}.qty`, { valueAsNumber: true })}
                            className="h-8 w-16 rounded-md border-outline-variant/30 bg-white px-2 text-right text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 align-middle">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register(`lineItems.${index}.rate`, { valueAsNumber: true })}
                            className="h-8 w-16 rounded-md border-outline-variant/30 bg-white px-2 text-right text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 text-right align-middle text-xs text-black">
                          ₹{total.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-2 py-2 align-middle">
                          <Controller
                            control={control}
                            name={`lineItems.${index}.gstPercent`}
                            render={({ field: controllerField }) => (
                              <Select
                                value={String(controllerField.value ?? 18)}
                                onValueChange={(value) => {
                                  controllerField.onChange(Number(value));
                                  setValue(`lineItems.${index}.gstPercent`, Number(value), {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                              >
                                <SelectTrigger className="h-8 w-20 border-outline-variant/30 bg-white px-2 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {GST_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 text-right align-middle text-xs font-medium text-emerald-600">
                          ₹{amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-1 py-2 text-center align-middle">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Totals Card */}
        <section className="flex justify-end rounded-xl border border-outline-variant/20 bg-surface p-6 shadow-sm">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-black">Subtotal:</span>
              <span className="font-medium text-on-surface">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-black">Discount:</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  className="h-7 w-16 rounded-md border-outline-variant/30 bg-white text-right text-sm"
                />
                <Select
                  value={discountType}
                  onValueChange={(value) => setDiscountType(value as '₹' | '%')}
                >
                  <SelectTrigger className="h-7 w-14 border-outline-variant/30 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹">₹</SelectItem>
                    <SelectItem value="%">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-red-500">Discount Amount:</span>
                <span className="font-medium text-red-500">
                  -₹{totals.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-black">Taxable Amount:</span>
              <span className="font-medium text-on-surface">
                ₹{totals.taxableAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-black">IGST:</span>
              <span className="font-medium text-on-surface">₹{totals.igst.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-black">Total Tax:</span>
              <span className="font-medium text-on-surface">₹{totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
              <span className="text-base font-bold text-on-surface">Grand Total:</span>
              <span className="text-lg font-extrabold text-emerald-600">
                ₹{totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Terms & Notes Card */}
        <section className="rounded-xl border border-outline-variant/20 bg-surface p-6 mb-17 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-on-surface">Terms & Notes</h2>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-black">Payment Terms</Label>
              <Input
                {...register('paymentTerms')}
                type="text"
                placeholder="e.g., Net 30 days"
                className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-black">Reference</Label>
              <Input
                {...register('reference')}
                type="text"
                placeholder="e.g., PO number, enquiry ref"
                className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col  gap-1.5">
            <Label className="text-xs font-medium text-black">Notes</Label>
            <Textarea
              placeholder="Additional notes for the customer..."
              rows={4}
              className="min-h-[120px] resize-y rounded-md border-outline-variant/30 bg-white text-sm"
            />
          </div>
        </section>

        {/* Action Buttons */}
        {/* <div className="flex items-center justify-end gap-2 pb-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="bg-blue-700 hover:bg-blue-800">Save Proforma</Button>
        </div> */}
      </div>
    </div>
  );
}
