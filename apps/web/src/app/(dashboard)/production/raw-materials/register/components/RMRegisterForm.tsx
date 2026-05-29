'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Box,
  ChevronDown,
  Clock,
  FileText,
  Image as ImageIcon,
  MapPin,
  Plus,
  Save,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { cn } from '@/lib/utils';

import { materialToFormValues } from '../lib/form-values';
import type { RawMaterial } from '../types';
import { rawMaterialFormSchema, RawMaterialFormValues } from '../validation/schema';
import formSchema from '../data/form-schema.json';

interface RMRegisterFormProps {
  itemCode: string;
  initialMaterial?: RawMaterial;
  onBack: () => void;
  onSave: (item: RawMaterialFormValues) => void;
}

type SectionId = 'basic' | 'purchase' | 'inventory' | 'attributes';

type SelectFieldName = 'unit' | 'currency' | 'preferredSupplier' | 'gstRate' | 'storageLocation';

type FormField = {
  name: keyof RawMaterialFormValues;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2 | 3;
  rows?: number;
  step?: number;
  options?: { value: string; label: string }[];
  helperText?: 'unitOnHand' | 'reorderBelow' | 'reorderQty';
  inputIcon?: 'clock' | 'mapPin';
};

type FormSection = {
  id: SectionId;
  title: string;
  icon: string;
  columns?: number;
  type?: 'dynamic';
  fields?: FormField[];
};

const sectionIcons: Record<string, LucideIcon> = {
  FileText,
  Tag,
  Box,
  SlidersHorizontal,
};

const unitLabels: Record<string, string> = {
  pcs: 'PCS',
  kg: 'KG',
  mtr: 'MTR',
  set: 'SET',
  box: 'BOX',
  ltr: 'LTR',
  sqft: 'SQFT',
};

function SectionHeader({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  action,
}: {
  title: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-13 w-full items-center gap-4 rounded-lg border border-gray-200 bg-slate-100 px-4 text-base font-semibold text-gray-950 transition hover:bg-slate-200/70">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-left"
      >
        <Icon className="size-5 shrink-0 text-slate-600" strokeWidth={1.8} />
        <span className="truncate">{title}</span>
      </button>
      {action ? <span className="shrink-0">{action}</span> : null}
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-white/70"
      >
        <ChevronDown
          className={cn('size-4 text-slate-600 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
    </div>
  );
}

function createAttributeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const emptyFormDefaults: RawMaterialFormValues = {
  name: '',
  category: '',
  qtyOnHand: 0,
  unit: 'pcs',
  description: '',
  currency: 'inr',
  standardRate: 0,
  preferredSupplier: 'none',
  hsnCode: '',
  gstRate: 'none',
  leadTime: undefined,
  minReorderLevel: 0,
  storageLocation: 'none',
  reorderQuantity: 0,
  imageUrl: '',
  attributes: [],
};

export function RMRegisterForm({ itemCode, initialMaterial, onBack, onSave }: RMRegisterFormProps) {
  const initialValues = initialMaterial ? materialToFormValues(initialMaterial) : emptyFormDefaults;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl ?? '');
  const [imageName, setImageName] = useState('');
  const [attributes, setAttributes] = useState<Array<{ id: string; name: string; value: string }>>(
    initialValues.attributes ?? [],
  );

  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    basic: true,
    purchase: true,
    inventory: true,
    attributes: true,
  });

  const sections = formSchema.sections as FormSection[];

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<RawMaterialFormValues>({
    resolver: zodResolver(rawMaterialFormSchema),
    defaultValues: initialValues,
  });

  const unit = watch('unit') ?? 'pcs';
  const unitLabel = unitLabels[unit] ?? unit.toUpperCase();

  const toggleSection = (id: SectionId) => {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  };

  const getHelperText = (helper?: FormField['helperText']) => {
    switch (helper) {
      case 'unitOnHand':
        return `${unitLabel} on hand`;
      case 'reorderBelow':
        return `Reorder when below this ${unitLabel}`;
      case 'reorderQty':
        return 'Qty to order per replenishment';
      default:
        return null;
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImageUrl(result);
      setImageName(file.name);
      setValue('imageUrl', result, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleAddAttribute = () => {
    setAttributes((current) => [...current, { id: createAttributeId(), name: '', value: '' }]);
    setOpenSections((current) => ({ ...current, attributes: true }));
  };

  const handleAttributeChange = (id: string, field: 'name' | 'value', value: string) => {
    setAttributes((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const onSubmit = handleSubmit((data) => {
    onSave({
      ...data,
      imageUrl: imageUrl || data.imageUrl,
      attributes: attributes
        .filter((attr) => attr.name.trim() && attr.value.trim())
        .map((attr) => ({
          id: attr.id,
          name: attr.name.trim(),
          value: attr.value.trim(),
        })),
    });
  });

  const renderField = (field: FormField, sectionColumns: number, sectionId: string) => {
    const fieldId = `rm-${sectionId}-${field.name}`;
    const error = errors[field.name];
    const helper = getHelperText(field.helperText);
    const colSpan =
      field.span === 2
        ? sectionColumns >= 2
          ? 'md:col-span-2'
          : ''
        : field.span === 3
          ? 'md:col-span-3'
          : '';

    return (
      <div key={`${sectionId}-${field.name}`} className={cn('space-y-1.5', colSpan)}>
        <Label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
          {field.label}
          {field.required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </Label>

        {field.type === 'select' ? (
          <Controller
            control={control}
            name={field.name as SelectFieldName}
            render={({ field: selectField }) => (
              <div className="relative">
                {field.inputIcon === 'mapPin' ? (
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-gray-400" />
                ) : null}
                <Select value={selectField.value || 'none'} onValueChange={selectField.onChange}>
                  <SelectTrigger
                    id={fieldId}
                    className={cn(
                      'h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm',
                      field.inputIcon === 'mapPin' && 'pl-9',
                    )}
                  >
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        ) : field.type === 'textarea' ? (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            rows={field.rows ?? 4}
            className="min-h-[100px] resize-none rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
            {...register(field.name)}
          />
        ) : (
          <div className="relative">
            {field.inputIcon === 'clock' ? (
              <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            ) : null}
            <Input
              id={fieldId}
              type={field.type}
              step={field.step}
              min={field.type === 'number' ? 0 : undefined}
              placeholder={field.placeholder}
              className={cn(
                'h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm',
                field.inputIcon === 'clock' && 'pl-9',
              )}
              {...register(field.name, {
                valueAsNumber: field.type === 'number',
              })}
            />
          </div>
        )}

        {helper ? <p className="text-xs text-gray-500">{helper}</p> : null}
        {error ? <p className="text-xs font-medium text-red-600">{error.message}</p> : null}
      </div>
    );
  };

  return (
    <form
      className="flex h-screen flex-col overflow-hidden bg-white"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-4">
        <div className="flex min-w-0 items-center gap-5">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="h-10 gap-2 px-0 text-base font-semibold text-gray-950 hover:bg-transparent"
          >
            <ArrowLeft className="size-5" />
            Back to List
          </Button>
          <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-base font-semibold text-gray-950">
            Item Code: {itemCode}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Button
            type="submit"
            className="h-10 gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Save className="size-4" />
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Close form"
            className="size-10 text-gray-950 hover:bg-gray-100"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-24">
          <div className="flex flex-col gap-4">
            {sections.map((section) => {
              if (section.type === 'dynamic') {
                const Icon = sectionIcons[section.icon] ?? SlidersHorizontal;
                return (
                  <section key={section.id} className="w-full">
                    <SectionHeader
                      title={section.title}
                      icon={Icon}
                      isOpen={openSections.attributes}
                      onToggle={() => toggleSection('attributes')}
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddAttribute}
                          className="h-9 gap-2 rounded-md border-gray-200 bg-white px-3 text-sm font-semibold text-gray-950 hover:bg-gray-50 shrink-0"
                        >
                          <Plus className="size-4" />
                          Add Attribute
                        </Button>
                      }
                    />
                    {openSections.attributes ? (
                      <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
                        <p className="mb-4 text-sm text-gray-500">
                          Custom key-value properties (Grade, Origin, Purity, Thickness...)
                        </p>
                        {attributes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-8">
                            <p className="text-center text-sm text-gray-500">
                              No attributes yet. Add custom properties like Grade, Origin, Purity,
                              Thickness...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {attributes.map((attribute) => (
                              <div key={attribute.id} className="flex items-center gap-3">
                                <Input
                                  value={attribute.name}
                                  onChange={(event) =>
                                    handleAttributeChange(attribute.id, 'name', event.target.value)
                                  }
                                  placeholder="Key (e.g. Grade)"
                                  className="h-10 min-w-0 flex-1 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                />
                                <Input
                                  value={attribute.value}
                                  onChange={(event) =>
                                    handleAttributeChange(attribute.id, 'value', event.target.value)
                                  }
                                  placeholder="Value (e.g. A+)"
                                  className="h-10 min-w-0 flex-[1.2] rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                />
                                <button
                                  type="button"
                                  aria-label="Remove attribute"
                                  onClick={() =>
                                    setAttributes((current) =>
                                      current.filter((item) => item.id !== attribute.id),
                                    )
                                  }
                                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash className="size-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </section>
                );
              }

              const Icon = sectionIcons[section.icon] ?? FileText;
              const sectionId = section.id as SectionId;
              const columns = section.columns ?? 3;
              const gridClass =
                columns === 2
                  ? 'md:grid-cols-2'
                  : columns === 3
                    ? 'md:grid-cols-3'
                    : 'md:grid-cols-1';

              return (
                <section key={section.id} className="space-y-4">
                  <SectionHeader
                    title={section.title}
                    icon={Icon}
                    isOpen={openSections[sectionId]}
                    onToggle={() => toggleSection(sectionId)}
                  />
                  {openSections[sectionId] ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                      <div className={cn('grid gap-x-4 gap-y-5', gridClass)}>
                        {section.fields?.map((field) => renderField(field, columns, section.id))}
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>

        <aside className="h-full w-[320px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white px-4 py-4">
          <h2 className="mb-4 text-base font-semibold text-gray-950">Item Image</h2>
          <div className="relative flex aspect-[1.42] items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={watch('name') || 'Raw material'}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center text-sm text-gray-700">
                <ImageIcon className="size-10 text-slate-600" strokeWidth={1.8} />
                <span>No image uploaded</span>
              </div>
            )}
          </div>
          {imageName ? <p className="mt-2 truncate text-xs text-gray-500">{imageName}</p> : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 h-10 w-full gap-2 rounded-md border-gray-200 text-base font-semibold text-gray-950"
          >
            <Upload className="size-4" />
            Upload Image
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-10 w-full gap-2 rounded-md border-gray-200 text-base font-semibold text-gray-950"
          >
            <Sparkles className="size-4" />
            Smart AI Auto Fill
          </Button>
        </aside>
      </div>
    </form>
  );
}
