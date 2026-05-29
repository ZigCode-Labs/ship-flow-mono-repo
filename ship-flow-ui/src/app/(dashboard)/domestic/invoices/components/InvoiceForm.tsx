'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Receipt,
  Banknote,
  FileText,
  Building2,
  User,
  Lock,
  Search,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Invoice, LineItem, TaxInvoiceFormConfig } from '../types';
import formConfigImport from '../data/tax-invoice-form.json';
import { useDomesticBuyersStore, type Buyer } from '@/store/domesticBuyers';

interface InvoiceFormProps {
  invoice?: Invoice;
  isNew?: boolean;
  initialExchangeRate?: number;
  onSave?: (invoice: Invoice) => void;
  onCancel?: () => void;
}

const typedFormConfig = formConfigImport as TaxInvoiceFormConfig;
const fieldRadiusClass = 'rounded-sm';
type DiscountType = 'amount' | 'percent';

function generateInitialFormState(config: TaxInvoiceFormConfig): Record<string, unknown> {
  const state: Record<string, unknown> = {};

  if (!config?.sections) {
    console.error('Form config sections is undefined', config);
    return state;
  }

  config.sections.forEach((section) => {
    if (!section.fields) return;
    section.fields.forEach((field) => {
      if (field.defaultToday && field.type === 'date') {
        state[field.id] = new Date().toISOString().split('T')[0];
      } else if (field.defaultValue !== undefined) {
        state[field.id] = field.defaultValue;
      } else if (field.autoGenerate) {
        state[field.id] = generateInvoiceNumber();
      } else if (field.sourceFrom) {
        const sourcePath = field.sourceFrom.replace('sellerProfile.', '');
        state[field.id] =
          config.sellerProfile[sourcePath as keyof typeof config.sellerProfile] || '';
      } else {
        state[field.id] = field.type === 'toggle' ? false : '';
      }
    });
  });

  return state;
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = (year + 1) % 100;
  const sequence = '001';
  return `DI-${year % 100}-${nextYear.toString().padStart(2, '0')}-${sequence}`;
}

type CustomerOption = {
  value: string;
  label: string;
  name: string;
  gstin: string;
  state: string;
};

function getDataSourceOptions(
  dataSource: string | undefined,
): Array<{ value: string; label: string; name?: string; gstin?: string }> {
  if (!dataSource || !typedFormConfig?.dataSources) return [];
  const source =
    typedFormConfig.dataSources[dataSource as keyof typeof typedFormConfig.dataSources];
  return Array.isArray(source) ? source : [];
}

function buyerToCustomerOption(buyer: Buyer): CustomerOption {
  return {
    value: buyer.id,
    label: buyer.companyName,
    name: buyer.companyName,
    gstin: buyer.gstin,
    state: buyer.state,
  };
}

function getInitialFormData(
  invoice: Invoice | undefined,
  isNew: boolean,
  initialExchangeRate: number | undefined,
): Record<string, unknown> {
  const initialState = generateInitialFormState(typedFormConfig);

  if (invoice && !isNew) {
    return {
      ...initialState,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      company_name: invoice.companyName,
      gstin: invoice.gstin,
      state: invoice.state,
      select_customer: invoice.customerId,
      customer_name: invoice.customerName,
      customer_gstin: invoice.customerGstin,
      place_of_supply: invoice.placeOfSupply,
      bank_name: invoice.bankName,
      account_number: invoice.accountNumber,
      ifsc_code: invoice.ifscCode,
      branch: invoice.branch,
      payment_terms: invoice.paymentTerms,
      reference: invoice.reference,
      notes: invoice.notes,
      usd_inr_rate: invoice.exchangeRate,
    };
  }

  if (isNew && typeof initialExchangeRate === 'number') {
    initialState.usd_inr_rate = initialExchangeRate;
  }

  return initialState;
}

function getInitialLineItems(invoice: Invoice | undefined, isNew: boolean): LineItem[] {
  if (!invoice || isNew) return [];
  return invoice.lineItems || [];
}

const indianStates = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli' },
  { value: 'DD', label: 'Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OD', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UT', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' },
];

function InvoiceDetailsSection({
  formData,
  onFieldChange,
}: {
  formData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  return (
    <Card className="border rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <CardTitle className="text-sm font-sans font-medium text-gray-700">
            Invoice Details
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invoice_number" className="text-sm font-sans text-gray-600">
              Invoice Number
            </Label>
            <Input
              id="invoice_number"
              type="text"
              placeholder="DI-26-27-001"
              value={(formData.invoice_number as string) || ''}
              onChange={(e) => onFieldChange('invoice_number', e.target.value)}
              className={`${fieldRadiusClass} bg-gray-50 font-sans`}
              readOnly={false}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invoice_date" className="text-sm font-sans text-gray-600">
              Invoice Date
            </Label>
            <Input
              id="invoice_date"
              type="date"
              value={(formData.invoice_date as string) || ''}
              onChange={(e) => onFieldChange('invoice_date', e.target.value)}
              className={`${fieldRadiusClass} font-sans`}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_date" className="text-sm font-sans text-gray-600">
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              value={(formData.due_date as string) || ''}
              onChange={(e) => onFieldChange('due_date', e.target.value)}
              className={`${fieldRadiusClass} font-sans`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExchangeRateSection({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [isLive, setIsLive] = useState(true);
  const [localRate, setLocalRate] = useState(value);

  useEffect(() => {
    setLocalRate(value);
  }, [value]);

  const fetchExchangeRate = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
      const data = await response.json();
      const newRate = data.rates.INR;
      setLocalRate(newRate);
      onChange(newRate);
      if (!silent) {
        toast.success('Exchange rate updated from API');
      }
    } catch {
      if (!silent) {
        toast.error('Failed to fetch exchange rate');
      }
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setIsLive(!checked); // checked = true means Locked mode, so isLive = false

    if (!checked) {
      // Switching to Live mode - fetch fresh rate
      fetchExchangeRate();
    } else {
      // Switching to Locked mode - keep current rate but allow editing
      setLocalRate(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = Number(e.target.value);
    setLocalRate(newRate);
    onChange(newRate);
  };

  return (
    <Card className="border">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">USD to INR Exchange Rate</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">1 USD =</span>
            <Input
              type="number"
              value={isLive ? localRate : localRate}
              onChange={handleInputChange}
              disabled={isLive}
              className={`w-28 h-10 ${fieldRadiusClass} bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              step="0.0001"
            />
            <span className="text-sm text-gray-600">INR</span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Switch
              checked={!isLive}
              onCheckedChange={handleToggleChange}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400"
            />
            <span className="text-sm text-gray-600 flex items-center gap-1">
              {isLive ? (
                'Live'
              ) : (
                <>
                  <Lock className="h-3 w-3" /> Locked
                </>
              )}
            </span>
          </div>
          {isLive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchExchangeRate()}
              className="gap-1 text-gray-600 rounded-full"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
          {isLive ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Live rate from Frankfurter API
            </span>
          ) : (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              Rate locked - manual entry enabled
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Item catalog prices are stored in USD. When you add items, they will be converted to INR
          using this rate.
        </p>
      </CardContent>
    </Card>
  );
}

function SellerDetailsSection({ formData }: { formData: Record<string, unknown> }) {
  return (
    <Card className="border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <CardTitle className="text-sm font-medium text-gray-700">Seller Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="company_name" className="text-sm text-gray-600">
            Company Name
          </Label>
          <Input
            id="company_name"
            type="text"
            value={(formData.company_name as string) || ''}
            className={`${fieldRadiusClass} bg-gray-50`}
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gstin" className="text-sm text-gray-600">
            GSTIN
          </Label>
          <Input
            id="gstin"
            type="text"
            value={(formData.gstin as string) || ''}
            className={`${fieldRadiusClass} bg-gray-50`}
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state" className="text-sm text-gray-600">
            State
          </Label>
          <Input
            id="state"
            type="text"
            value={(formData.state as string) || ''}
            className={`${fieldRadiusClass} bg-gray-50`}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerDetailsSection({
  formData,
  onFieldChange,
  customerOptions,
  isLoadingCustomers,
}: {
  formData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
  customerOptions: CustomerOption[];
  isLoadingCustomers: boolean;
}) {
  const handleCustomerChange = (value: string) => {
    const customer = customerOptions.find((c) => c.value === value);
    onFieldChange('select_customer', value);
    if (customer) {
      const placeOfSupply =
        indianStates.find((state) => state.label === customer.state)?.value || customer.state;
      onFieldChange('customer_name', customer.name);
      onFieldChange('customer_gstin', customer.gstin);
      onFieldChange('place_of_supply', placeOfSupply);
    }
  };

  return (
    <Card className="border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <CardTitle className="text-sm font-medium text-gray-700">Customer Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="select_customer" className="text-sm text-gray-600">
            Select Customer
          </Label>
          <Select
            value={(formData.select_customer as string) || ''}
            onValueChange={handleCustomerChange}
          >
            <SelectTrigger className={`${fieldRadiusClass} text-gray-500`}>
              <SelectValue placeholder="Select a domestic buyer" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCustomers ? (
                <SelectItem value="loading-buyers" disabled>
                  Loading buyers...
                </SelectItem>
              ) : customerOptions.length > 0 ? (
                customerOptions.map((buyer) => (
                  <SelectItem key={buyer.value} value={buyer.value}>
                    {buyer.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-buyers" disabled>
                  No domestic buyers found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer_name" className="text-sm text-gray-600">
            Customer Name
          </Label>
          <Input
            id="customer_name"
            type="text"
            value={(formData.customer_name as string) || ''}
            onChange={(e) => onFieldChange('customer_name', e.target.value)}
            placeholder="Enter customer name"
            className={fieldRadiusClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer_gstin" className="text-sm text-gray-600">
            Customer GSTIN
          </Label>
          <Input
            id="customer_gstin"
            type="text"
            placeholder="e.g., 27AABCU9603R1ZM"
            value={(formData.customer_gstin as string) || ''}
            onChange={(e) => onFieldChange('customer_gstin', e.target.value)}
            className={fieldRadiusClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="place_of_supply" className="text-sm text-gray-600">
            Place of Supply
          </Label>
          <Select
            value={(formData.place_of_supply as string) || ''}
            onValueChange={(val) => onFieldChange('place_of_supply', val)}
          >
            <SelectTrigger className={`${fieldRadiusClass} text-gray-500`}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {indianStates.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function BankDetailsSection({
  formData,
  onFieldChange,
}: {
  formData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-gray-500" />
          <CardTitle className="text-sm font-medium text-gray-700">Bank Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank_name" className="text-sm text-gray-600">
              Bank Name
            </Label>
            <Input
              id="bank_name"
              type="text"
              placeholder="Enter bank name"
              value={(formData.bank_name as string) || ''}
              onChange={(e) => onFieldChange('bank_name', e.target.value)}
              className={fieldRadiusClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account_number" className="text-sm text-gray-600">
              Account Number
            </Label>
            <Input
              id="account_number"
              type="text"
              placeholder="Enter account number"
              value={(formData.account_number as string) || ''}
              onChange={(e) => onFieldChange('account_number', e.target.value)}
              className={fieldRadiusClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifsc_code" className="text-sm text-gray-600">
              IFSC Code
            </Label>
            <Input
              id="ifsc_code"
              type="text"
              placeholder="Enter IFSC code"
              value={(formData.ifsc_code as string) || ''}
              onChange={(e) => onFieldChange('ifsc_code', e.target.value)}
              className={fieldRadiusClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch" className="text-sm text-gray-600">
              Branch
            </Label>
            <Input
              id="branch"
              type="text"
              placeholder="Enter branch name"
              value={(formData.branch as string) || ''}
              onChange={(e) => onFieldChange('branch', e.target.value)}
              className={fieldRadiusClass}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
      >
        <span className={`min-w-0 truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedLabel}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg"
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }}
        >
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
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
    </>
  );
}

function LineItemsSection({
  lineItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: {
  lineItems: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void;
}) {
  const itemCodeOptions = getDataSourceOptions('itemCatalog');
  const gstOptions =
    getDataSourceOptions('gstRates').length > 0
      ? getDataSourceOptions('gstRates')
      : [
          { value: '0', label: '0%' },
          { value: '5', label: '5%' },
          { value: '12', label: '12%' },
          { value: '18', label: '18%' },
          { value: '28', label: '28%' },
        ];

  const GRID_TEMPLATE =
    'minmax(110px, 1.25fr) minmax(96px, 1.1fr) 90px 72px 86px 92px 72px 92px 28px';

  const inputClassName =
    'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm box-border focus-visible:ring-1 focus-visible:ring-blue-500/30';

  const selectTriggerClassName =
    'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm box-border focus:ring-1 focus:ring-blue-500/30';

  const headerCellClass = 'flex items-center px-2 text-[14px] font-semibold text-gray-900';

  const bodyCellClass = 'flex min-w-0 items-center px-2';

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex flex-row items-center justify-between px-7 pb-4 pt-7">
        <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="h-10 gap-3 rounded-md border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="px-7 pb-7">
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <div className="min-w-[760px]">
            {/* Header Row - Uses SAME grid template */}
            <div
              className="grid border-b border-gray-200 bg-gray-50 py-2.5"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              <div className={`${headerCellClass} justify-start`}>Item Code</div>
              <div className={`${headerCellClass} justify-start`}>Description</div>
              <div className={`${headerCellClass} justify-start`}>HSN</div>
              <div className={`${headerCellClass} justify-center`}>Qty</div>
              <div className={`${headerCellClass} justify-center`}>Rate (₹)</div>
              <div className={`${headerCellClass} justify-end`}>Amount</div>
              <div className={`${headerCellClass} justify-center`}>GST %</div>
              <div className={`${headerCellClass} justify-end`}>Total</div>
              <div className={`${headerCellClass} justify-center`}></div>
            </div>

            {/* Body Rows Container */}
            <div>
              {!lineItems || lineItems.length === 0 ? (
                /* Empty State - Uses SAME grid template for alignment */
                <div className="grid items-center" style={{ gridTemplateColumns: GRID_TEMPLATE }}>
                  <div className="col-span-9 px-3 py-10">
                    <span className="text-sm text-gray-400">
                      No items added. Click &quot;Add Item&quot; to add line items, or select from
                      your Item Register.
                    </span>
                  </div>
                </div>
              ) : (
                lineItems.map((item) => (
                  /* Data Row - Uses SAME grid template */
                  <div
                    key={item.id}
                    className="grid items-center border-b border-gray-200 py-2.5 last:border-b-0 hover:bg-gray-50/50"
                    style={{ gridTemplateColumns: GRID_TEMPLATE }}
                  >
                    {/* Item Code */}
                    <div className={bodyCellClass}>
                      <SearchableSelect
                        value={item.itemCode}
                        onChange={(value) => onUpdateItem(item.id, 'itemCode', value)}
                        options={itemCodeOptions}
                        placeholder="Select"
                      />
                    </div>

                    {/* Description */}
                    <div className={bodyCellClass}>
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
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

                    {/* Amount - read-only */}
                    <div className={`${bodyCellClass} justify-end`}>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{item.amount.toFixed(2)}
                      </span>
                    </div>

                    {/* GST% */}
                    <div className={bodyCellClass}>
                      <Select
                        value={item.gst.toString()}
                        onValueChange={(value) => onUpdateItem(item.id, 'gst', Number(value))}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="18%" />
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

                    {/* Total - read-only */}
                    <div className={`${bodyCellClass} justify-end`}>
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{item.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className={`${bodyCellClass} justify-center`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove line item"
                        className="h-7 w-7 shrink-0 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Totals Section
function TotalsSection({
  computedValues,
  discount,
  discountType,
  onDiscountChange,
  onDiscountTypeChange,
}: {
  computedValues: {
    subtotal: number;
    discountAmount: number;
    taxableAmount: number;
    igst: number;
    totalTax: number;
    grandTotal: number;
  };
  discount: number;
  discountType: DiscountType;
  onDiscountChange: (val: number) => void;
  onDiscountTypeChange: (val: DiscountType) => void;
}) {
  return (
    <Card className="border">
      <CardContent className="pt-4 pb-4">
        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">₹{computedValues.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-600">Discount:</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={discount}
                onChange={(e) => onDiscountChange(Number(e.target.value))}
                className={`${fieldRadiusClass} w-20 h-8 text-right`}
                step="0.01"
              />
              <Select
                value={discountType}
                onValueChange={(value) => onDiscountTypeChange(value as DiscountType)}
              >
                <SelectTrigger className={`${fieldRadiusClass} w-14 h-8`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">₹</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {discountType === 'percent' && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Discount Amount:</span>
              <span className="text-gray-700">₹{computedValues.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxable Amount:</span>
            <span className="text-gray-900">₹{computedValues.taxableAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IGST:</span>
            <span className="text-gray-900">₹{computedValues.igst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Tax:</span>
            <span className="text-gray-900">₹{computedValues.totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold text-gray-900">Grand Total:</span>
            <span className="font-semibold text-blue-600">
              ₹{computedValues.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Terms & Notes Section
function TermsNotesSection({
  formData,
  onFieldChange,
}: {
  formData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  return (
    <Card className="border mb-15">
      <CardHeader className="pb-3 ">
        <CardTitle className="text-sm font-medium text-gray-700 ">Terms & Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="payment_terms" className="text-sm text-gray-600">
              Payment Terms
            </Label>
            <Input
              id="payment_terms"
              type="text"
              placeholder="e.g., Net 30 days"
              value={(formData.payment_terms as string) || ''}
              onChange={(e) => onFieldChange('payment_terms', e.target.value)}
              className={fieldRadiusClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reference" className="text-sm text-gray-600">
              Reference
            </Label>
            <Input
              id="reference"
              type="text"
              placeholder="e.g., PO number"
              value={(formData.reference as string) || ''}
              onChange={(e) => onFieldChange('reference', e.target.value)}
              className={fieldRadiusClass}
            />
          </div>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes" className="text-sm text-gray-600">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Additional notes for the customer..."
            value={(formData.notes as string) || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className={`${fieldRadiusClass} min-h-[100px] resize-none`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceForm({
  invoice,
  isNew = true,
  initialExchangeRate,
  onSave,
  onCancel,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    getInitialFormData(invoice, isNew, initialExchangeRate),
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(() => getInitialLineItems(invoice, isNew));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [discount, setDiscount] = useState(() => (invoice && !isNew ? invoice.discount : 0));
  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  const formBodyRef = useRef<HTMLDivElement>(null);
  const didRequestBuyersRef = useRef(false);
  const buyers = useDomesticBuyersStore((state) => state.buyers);
  const isLoadingBuyers = useDomesticBuyersStore((state) => state.isLoading);
  const fetchBuyers = useDomesticBuyersStore((state) => state.fetchBuyers);

  useEffect(() => {
    if (buyers.length === 0 && !isLoadingBuyers && !didRequestBuyersRef.current) {
      didRequestBuyersRef.current = true;
      void fetchBuyers();
    }
  }, [buyers.length, fetchBuyers, isLoadingBuyers]);

  useEffect(() => {
    if (formBodyRef.current) {
      formBodyRef.current.scrollTop = 0;
    }
  }, [isNew, invoice?.id]);

  const computedValues = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const normalizedDiscount = Number.isFinite(discount) ? Math.max(discount, 0) : 0;
    const discountAmount =
      discountType === 'percent'
        ? (subtotal * Math.min(normalizedDiscount, 100)) / 100
        : Math.min(normalizedDiscount, subtotal);
    const taxableAmount = Math.max(subtotal - discountAmount, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + (item.amount * item.gst) / 100, 0);
    const grandTotal = taxableAmount + totalTax;

    return {
      subtotal,
      discount: discountAmount,
      discountAmount,
      taxableAmount,
      igst: totalTax, // IGST is the same as totalTax for domestic invoices
      totalTax,
      grandTotal,
    };
  }, [lineItems, discount, discountType]);

  const customerOptions = useMemo(
    () => buyers.filter((buyer) => buyer.status !== 'trash').map(buyerToCustomerOption),
    [buyers],
  );

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => {
      const newData = { ...prev, [fieldId]: value };

      if (fieldId === 'select_customer' && value) {
        const customers = getDataSourceOptions('domesticBuyers');
        const selectedCustomer = customers.find((c) => c.value === value);
        if (selectedCustomer) {
          newData.customer_name = selectedCustomer.name || '';
          newData.customer_gstin = selectedCustomer.gstin || '';
        }
      }

      return newData;
    });

    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === 'quantity' || field === 'rate') {
            const quantity = field === 'quantity' ? Number(value) : item.quantity;
            const rate = field === 'rate' ? Number(value) : item.rate;
            const amount = quantity * rate;
            updatedItem.amount = amount;
            updatedItem.total = amount + (amount * updatedItem.gst) / 100;
          } else if (field === 'gst') {
            updatedItem.gst = Number(value);
            updatedItem.total = updatedItem.amount + (updatedItem.amount * updatedItem.gst) / 100;
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleAddLineItem = () => {
    setLineItems((prev = []) => {
      const newItem: LineItem = {
        id: Date.now().toString(),
        itemCode: '',
        description: '',
        hsn: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        gst: 18,
        total: 0,
      };
      return [...prev, newItem];
    });
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    typedFormConfig?.sections?.forEach((section) => {
      if (!section.fields) return;
      section.fields.forEach((field) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label} is required`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const invoiceData: Invoice = {
      id: invoice?.id || Date.now().toString(),
      invoiceNumber: (formData.invoice_number as string) || '',
      invoiceDate: (formData.invoice_date as string) || '',
      dueDate: (formData.due_date as string) || '',
      companyName: (formData.company_name as string) || '',
      gstin: (formData.gstin as string) || '',
      state: (formData.state as string) || '',
      customerId: (formData.select_customer as string) || '',
      customerName: (formData.customer_name as string) || '',
      customerGstin: (formData.customer_gstin as string) || '',
      placeOfSupply: (formData.place_of_supply as string) || '',
      bankName: (formData.bank_name as string) || '',
      accountNumber: (formData.account_number as string) || '',
      ifscCode: (formData.ifsc_code as string) || '',
      branch: (formData.branch as string) || '',
      paymentTerms: (formData.payment_terms as string) || '',
      reference: (formData.reference as string) || '',
      notes: (formData.notes as string) || '',
      exchangeRate: Number(formData.usd_inr_rate) || 93.44,
      lineItems,
      subtotal: computedValues.subtotal,
      discount: computedValues.discount,
      taxableAmount: computedValues.taxableAmount,
      totalTax: computedValues.totalTax,
      grandTotal: computedValues.grandTotal,
      amount: computedValues.grandTotal,
      status: invoice?.status || 'draft',
    };

    onSave?.(invoiceData);
    toast.success('Invoice saved successfully');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={onCancel} className="flex-shrink-0 px-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1 text-sm">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1 rounded">
                <Receipt className="h-4 w-4 text-blue-600" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 whitespace-nowrap">
                {isNew ? 'New Tax Invoice' : `Edit ${invoice?.invoiceNumber || 'Tax Invoice'}`}
              </h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 whitespace-nowrap gap-2"
          >
            <Receipt className="h-4 w-4" />
            Save Invoice
          </Button>
        </div>
      </div>

      <div ref={formBodyRef} className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="mx-auto max-w-5xl space-y-4">
          <InvoiceDetailsSection formData={formData} onFieldChange={handleFieldChange} />

          <ExchangeRateSection
            value={Number(formData.usd_inr_rate) || 93.06}
            onChange={(val) => handleFieldChange('usd_inr_rate', val)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SellerDetailsSection formData={formData} />
            <CustomerDetailsSection
              formData={formData}
              onFieldChange={handleFieldChange}
              customerOptions={customerOptions}
              isLoadingCustomers={isLoadingBuyers}
            />
          </div>

          <BankDetailsSection formData={formData} onFieldChange={handleFieldChange} />

          <LineItemsSection
            lineItems={lineItems}
            onAddItem={handleAddLineItem}
            onRemoveItem={handleRemoveLineItem}
            onUpdateItem={handleUpdateLineItem}
          />

          <TotalsSection
            computedValues={computedValues}
            discount={discount}
            discountType={discountType}
            onDiscountChange={setDiscount}
            onDiscountTypeChange={setDiscountType}
          />

          <TermsNotesSection formData={formData} onFieldChange={handleFieldChange} />
        </div>
      </div>
    </div>
  );
}
