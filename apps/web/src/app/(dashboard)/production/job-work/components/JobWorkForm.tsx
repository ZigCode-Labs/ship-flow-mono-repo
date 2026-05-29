'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  Wrench,
  FileText,
  ChevronDown,
  Package,
  MessageSquare,
  X,
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
import { cn } from '@/lib/utils';
import {
  jobWorkFormSchema,
  type JobWorkFormValues,
  type IssueLine,
  type ComputedValues,
} from '../types/form';
import type { JobWorkFormConfig } from '../types/form';
import jobWorkFormConfig from '../data/job-work-form-config.json';

interface JobWorkFormProps {
  initialData?: Partial<JobWorkFormValues>;
  onSave?: (data: JobWorkFormValues) => void;
  onCancel?: () => void;
  title?: string;
  successDescription?: string;
}

const typedFormConfig = jobWorkFormConfig as JobWorkFormConfig;
const fieldClassName =
  'h-8 rounded-[4px] border-slate-300 bg-white px-2 text-[11px] text-slate-950 shadow-none placeholder:text-slate-500 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300';
const textareaClassName =
  'min-h-0 rounded-[4px] border-slate-300 bg-white px-2 py-2 text-[11px] text-slate-950 shadow-none placeholder:text-slate-500 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300';
const labelClassName = 'text-[10px] font-medium leading-none text-black';

// Generate Job Work Number
function generateJobWorkNumber(): string {
  const sequence = '00001';
  return `JW-${sequence}`;
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
        className="flex h-8 w-full items-center justify-between rounded-[4px] border border-slate-300 bg-white px-2 text-[11px] text-slate-950 shadow-none hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      >
        <span className={value ? 'text-slate-950' : 'text-slate-500'}>{selectedLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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

function IssueLinesSection({
  issueLines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: {
  issueLines: IssueLine[];
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onUpdateLine: (id: string, field: keyof IssueLine, value: string | number) => void;
}) {
  const GRID_TEMPLATE = 'minmax(88px,1.4fr) minmax(115px,1.9fr) 45px 45px 56px 56px 60px 24px 24px';
  const hasLines = issueLines.length > 0;

  const lineItems = typedFormConfig.dataSources.issueItems;
  const rowInputClassName =
    'h-9 rounded-[4px] border-slate-300 bg-white px-2 text-sm shadow-none placeholder:text-slate-500 focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-200';
  const headerCellClass = 'flex h-9 items-center px-2 text-xs font-semibold text-slate-600';
  const bodyCellClass = 'flex h-[50px] items-center px-2';

  return (
    <div
      className={cn(
        'w-full overflow-hidden border border-slate-200 bg-white shadow-sm',
        hasLines ? 'rounded-[8px]' : 'rounded-[6px]',
      )}
    >
      <div
        className={cn(
          'flex flex-row items-center justify-between',
          hasLines ? 'px-7 py-[26px]' : 'px-[18px] py-[18px]',
        )}
      >
        <h3 className={cn('font-semibold text-black', hasLines ? 'text-lg' : 'text-xs')}>
          Issue Lines
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddLine}
          className={cn(
            'border-slate-200 bg-white text-black shadow-none hover:bg-slate-50',
            hasLines
              ? 'h-[50px] gap-3 rounded-[6px] px-5 text-base font-semibold'
              : 'h-7 gap-2 rounded-[4px] px-3 text-xs font-medium',
          )}
        >
          <Plus className={hasLines ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
          Add Line
        </Button>
      </div>

      {!hasLines ? (
        <div className="border-t border-dashed border-slate-200 px-[18px] py-7 text-center">
          <span className="text-[12px] text-slate-400">
            No items added. Click &quot;Add Line&quot; to add issue lines.
          </span>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <div className="w-full">
            <div
              className="grid border-y border-slate-200 bg-slate-50"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              <div className={headerCellClass}>Item</div>
              <div className={headerCellClass}>Work Operation</div>
              <div className={`${headerCellClass} justify-center`}>Qty</div>
              <div className={`${headerCellClass} justify-center`}>Unit</div>
              <div className={`${headerCellClass} justify-center`}>Rate</div>
              <div className={`${headerCellClass} justify-center`}>Disc</div>
              <div className={`${headerCellClass} justify-end`}>Amount</div>
              <div className={headerCellClass} />
              <div className={headerCellClass} />
            </div>

            <div>
              {issueLines.map((line) => (
                <div
                  key={line.id}
                  className="grid items-center"
                  style={{ gridTemplateColumns: GRID_TEMPLATE }}
                >
                  <div className={bodyCellClass}>
                    <Select
                      value={line.itemCode}
                      onValueChange={(value) => {
                        const selectedItem = lineItems.find((item) => item.value === value);
                        onUpdateLine(line.id, 'itemCode', value);
                        onUpdateLine(line.id, 'itemName', selectedItem?.label ?? '');
                      }}
                    >
                      <SelectTrigger className="h-9 rounded-[4px] border-slate-300 bg-white px-2 text-sm shadow-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {lineItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={line.workOperation}
                      onChange={(e) => onUpdateLine(line.id, 'workOperation', e.target.value)}
                      placeholder="e.g., Stitching"
                      className={rowInputClassName}
                    />
                  </div>

                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => onUpdateLine(line.id, 'quantity', Number(e.target.value))}
                      min="1"
                      className={`${rowInputClassName} px-2 text-center`}
                    />
                  </div>

                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={line.unit}
                      onChange={(e) => onUpdateLine(line.id, 'unit', e.target.value)}
                      placeholder="PC"
                      className={`${rowInputClassName} px-2 text-center`}
                    />
                  </div>

                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={line.rate}
                      onChange={(e) => onUpdateLine(line.id, 'rate', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`${rowInputClassName} px-2 text-right`}
                    />
                  </div>

                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={line.discount}
                      onChange={(e) => onUpdateLine(line.id, 'discount', Number(e.target.value))}
                      min="0"
                      max="100"
                      className={`${rowInputClassName} px-2 text-center`}
                    />
                  </div>

                  <div className={`${bodyCellClass} justify-end`}>
                    <span className="text-sm font-semibold text-slate-950">
                      {line.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className={`${bodyCellClass} justify-center`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-slate-400 hover:bg-transparent hover:text-slate-600"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className={`${bodyCellClass} justify-center`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemoveLine(line.id)}
                      className="h-8 w-8 text-slate-400 hover:bg-transparent hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Totals Section
function TotalsSection({
  computedValues,
  onOverallDiscountChange,
}: {
  computedValues: ComputedValues;
  onOverallDiscountChange: (val: number) => void;
}) {
  return (
    <Card className="gap-0 rounded-[6px] border border-slate-200 bg-white py-0 shadow-sm">
      <CardContent className="px-[18px] py-4">
        <div className="ml-auto max-w-[290px] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-700">Subtotal:</span>
            <span className="text-slate-950">{computedValues.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700">Overall Discount:</span>
            <Input
              type="number"
              value={computedValues.overallDiscount}
              onChange={(e) => onOverallDiscountChange(Number(e.target.value))}
              className="h-7 w-[84px] rounded-[4px] border-slate-300 bg-white px-2 text-right text-xs shadow-none focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
              min="0"
              max="100"
            />
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-xs">
            <span className="font-semibold text-slate-950">Total Job Work Value:</span>
            <span className="font-semibold text-blue-600">
              {computedValues.totalJobWorkValue.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Form Component
export function JobWorkForm({
  initialData,
  onSave,
  onCancel,
  title = 'New Job Work Order',
  successDescription = 'Job Work order created',
}: JobWorkFormProps) {
  const router = useRouter();
  const [issueLines, setIssueLines] = useState<IssueLine[]>(initialData?.issueLines ?? []);
  const [overallDiscount, setOverallDiscount] = useState(initialData?.overallDiscount ?? 0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(jobWorkFormSchema),
    defaultValues: {
      jobWorkNumber: generateJobWorkNumber(),
      jobWorkType: '',
      issueDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
      jobWorker: '',
      issueTime: '',
      jobWorkerAddress: '',
      remarks: '',
      overallDiscount: 0,
      issueLines: [],
      ...initialData,
    },
  });

  const selectedJobWorker = useWatch({ control, name: 'jobWorker' });

  // Auto-fill job worker details when job worker changes
  useEffect(() => {
    if (selectedJobWorker) {
      const worker = typedFormConfig.dataSources.jobWorkers.find(
        (w) => w.value === selectedJobWorker,
      );
      if (worker) {
        setValue('jobWorkerAddress', worker.address || '');
      }
    }
  }, [selectedJobWorker, setValue]);

  const computedValues: ComputedValues = useMemo(() => {
    const subtotal = issueLines.reduce((sum, line) => sum + line.amount, 0);
    const discountAmount = subtotal * (overallDiscount / 100);
    const totalJobWorkValue = subtotal - discountAmount;

    return {
      subtotal,
      overallDiscount,
      totalJobWorkValue,
    };
  }, [issueLines, overallDiscount]);

  // Issue line handlers
  const handleAddLine = useCallback(() => {
    const newLine: IssueLine = {
      id: generateId(),
      itemCode: '',
      itemName: '',
      workOperation: '',
      quantity: 1,
      unit: 'PC',
      rate: 0,
      discount: 0,
      amount: 0,
      total: 0,
      remarks: '',
    };
    setIssueLines((prev) => [...prev, newLine]);
  }, []);

  const handleRemoveLine = useCallback((id: string) => {
    setIssueLines((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const handleUpdateLine = useCallback(
    (id: string, field: keyof IssueLine, value: string | number) => {
      setIssueLines((prev) =>
        prev.map((line) => {
          if (line.id !== id) return line;

          const updated = { ...line, [field]: value };
          const shouldRecalculate =
            field === 'quantity' || field === 'rate' || field === 'discount';

          // Recalculate amount
          if (shouldRecalculate) {
            const grossAmount = updated.quantity * updated.rate;
            const discountAmount = (grossAmount * updated.discount) / 100;
            updated.amount = grossAmount - discountAmount;
            updated.total = updated.amount;
          }

          return updated;
        }),
      );
    },
    [],
  );

  const handleOverallDiscountChange = useCallback(
    (val: number) => {
      setOverallDiscount(val);
      setValue('overallDiscount', val);
    },
    [setValue],
  );

  const handleFormSubmit = (data: JobWorkFormValues) => {
    const formData: JobWorkFormValues = {
      ...data,
      issueLines,
      overallDiscount,
    };
    const validationResult = jobWorkFormSchema.safeParse(formData);

    if (!validationResult.success) {
      toast.error('Validation Error', {
        description: validationResult.error.issues[0]?.message ?? 'Please check the form inputs',
      });
      return;
    }

    if (onSave) {
      onSave(validationResult.data);
    }

    toast('Success', {
      description: successDescription,
      position: 'top-right',
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Helper to get data source options
  const getDataSourceOptions = (dataSource: string) => {
    return (
      typedFormConfig.dataSources[dataSource as keyof typeof typedFormConfig.dataSources] || []
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-[18px]">
      {/* Header */}
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
            <Wrench className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        </div>
        <Button
          type="submit"
          className="h-9 gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          Save
        </Button>
      </div>

      {/* Job Work Details Card */}
      <Card className="gap-0 rounded-[6px] border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="px-[18px] pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-black" />
            <CardTitle className="text-xs font-semibold text-black">Job Work Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-[18px] pb-[18px]">
          <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
            {/* Job Work Number */}
            <div className="space-y-1.5">
              <Label htmlFor="jobWorkNumber" className={labelClassName}>
                Job Work Number
              </Label>
              <Controller
                name="jobWorkNumber"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="jobWorkNumber" readOnly className={fieldClassName} />
                )}
              />
            </div>

            {/* Job Work Type */}
            <div className="space-y-1.5">
              <Label htmlFor="jobWorkType" className={labelClassName}>
                Job Work Type
              </Label>
              <Controller
                name="jobWorkType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldClassName}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDataSourceOptions('jobWorkTypes').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.jobWorkType && (
                <p className="text-xs text-red-500">{errors.jobWorkType.message}</p>
              )}
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <Label htmlFor="issueDate" className={labelClassName}>
                Issue Date
              </Label>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="issueDate" type="date" className={fieldClassName} />
                )}
              />
            </div>

            {/* Expected Return Date */}
            <div className="space-y-1.5">
              <Label htmlFor="expectedReturnDate" className={labelClassName}>
                Expected Return Date
              </Label>
              <Controller
                name="expectedReturnDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="expectedReturnDate"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    className={fieldClassName}
                  />
                )}
              />
            </div>

            {/* Job Worker */}
            <div className="space-y-1.5">
              <Label htmlFor="jobWorker" className={labelClassName}>
                Job Worker
              </Label>
              <Controller
                name="jobWorker"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={getDataSourceOptions('jobWorkers')}
                    placeholder="Select job worker"
                  />
                )}
              />
              {errors.jobWorker && (
                <p className="text-xs text-red-500">{errors.jobWorker.message}</p>
              )}
            </div>

            {/* Issue Time */}
            <div className="space-y-1.5">
              <Label htmlFor="issueTime" className={labelClassName}>
                Issue Time
              </Label>
              <Controller
                name="issueTime"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="issueTime"
                    type="time"
                    placeholder="--:-- --"
                    className={fieldClassName}
                  />
                )}
              />
            </div>

            {/* Job Worker Address */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="jobWorkerAddress" className={labelClassName}>
                Job Worker Address
              </Label>
              <Controller
                name="jobWorkerAddress"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="jobWorkerAddress"
                    placeholder="Enter job worker address"
                    rows={3}
                    className={`${textareaClassName} h-[58px]`}
                  />
                )}
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="remarks" className={labelClassName}>
                Remarks
              </Label>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="remarks"
                    placeholder="Additional remarks..."
                    rows={3}
                    className={`${textareaClassName} h-[58px]`}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Lines Section */}
      <IssueLinesSection
        issueLines={issueLines}
        onAddLine={handleAddLine}
        onRemoveLine={handleRemoveLine}
        onUpdateLine={handleUpdateLine}
      />

      {/* Totals Section */}
      <TotalsSection
        computedValues={computedValues}
        onOverallDiscountChange={handleOverallDiscountChange}
      />
    </form>
  );
}
