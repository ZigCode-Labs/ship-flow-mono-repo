'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Box,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Plus,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import basicDetailsFormConfig from '../data/basic-details-form.json';
import dynamicAttributesFormConfig from '../data/dynamic-attributes-form.json';
import {
  ProductionItem,
  ProductionItemAttribute,
  ProductionItemComponent,
  ProductionItemSpecFile,
} from '../types';

type ProductionItemDraft = Omit<ProductionItem, 'id' | 'createdAt' | 'updatedAt'>;

interface ItemRegisterFormProps {
  itemCode: string;
  onBack: () => void;
  onSave: (item: ProductionItemDraft) => void;
}

type SectionKey = 'basic' | 'components' | 'specFiles' | 'attributes';

const itemTypeValues = ['finished_goods', 'raw_material', 'component', 'sub_assembly'] as const;

const productionSourceValues = ['in_house', 'outsourced'] as const;

const unitValues = ['pcs', 'kg', 'mtr', 'set', 'box'] as const;

const currencyValues = ['inr', 'usd', 'eur', 'gbp'] as const;

const basicDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(120),
  type: z.enum(itemTypeValues),
  category: z.string().trim().max(80).optional().or(z.literal('')),
  productionSource: z.enum(productionSourceValues).optional().or(z.literal('')),
  manufacturer: z.string().trim().max(80).optional().or(z.literal('')),
  quantity: z
    .string()
    .trim()
    .refine((value) => value === '' || !Number.isNaN(Number(value)), {
      message: 'Quantity must be a number',
    })
    .refine((value) => value === '' || Number(value) >= 0, {
      message: 'Quantity must be 0 or greater',
    }),
  unit: z.enum(unitValues),
  currency: z.enum(currencyValues).optional().or(z.literal('')),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  itemPrice: z.string().trim().max(20).optional().or(z.literal('')),
  isManualPrice: z.boolean().optional(),
  productionNotes: z.string().trim().max(500).optional().or(z.literal('')),
});

type BasicDetailsFormValues = z.infer<typeof basicDetailsSchema>;

const shapeValues = ['box', 'cylinder', 'sphere', 'custom'] as const;

const componentSchema = z.object({
  name: z.string().trim().min(1, 'Component name is required').max(120),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  shape: z.enum(shapeValues),
  length: z.string().trim().max(50).optional().or(z.literal('')),
  breadth: z.string().trim().max(50).optional().or(z.literal('')),
  height: z.string().trim().max(50).optional().or(z.literal('')),
  material: z.string().trim().max(100).optional().or(z.literal('')),
  finish: z.string().trim().max(100).optional().or(z.literal('')),
  costPerUnit: z.string().trim().max(20).optional().or(z.literal('')),
  isFragile: z.boolean(),
  assemblyRequired: z.boolean(),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  customAttribute: z.string().trim().max(200).optional().or(z.literal('')),
});

type ComponentFormValues = z.infer<typeof componentSchema>;

const attributeSchema = z.object({
  key: z.string().trim().min(1, 'Key is required').max(50),
  value: z.string().trim().min(1, 'Value is required').max(100),
});

type AttributeFormValues = z.infer<typeof attributeSchema>;

type DynamicAttributeField = {
  name: keyof AttributeFormValues;
  label: string;
  type: 'text';
  placeholder: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    customMessage?: string;
  };
};

type BasicDetailsField = {
  name: keyof BasicDetailsFormValues;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  placeholderEnabled?: string;
  required?: boolean;
  span?: 1 | 2 | 3;
  rows?: number;
  min?: number;
  max?: number;
  hasToggle?: boolean;
  toggleLabel?: string;
  options?: {
    value: string;
    label: string;
  }[];
};

const basicDetailsFields = basicDetailsFormConfig.fields as BasicDetailsField[];

const dynamicAttributesFields = dynamicAttributesFormConfig.fields as DynamicAttributeField[];

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createComponent = (): ProductionItemComponent => ({
  id: createId(),
  name: '',
  quantity: 1,
  shape: 'box',
  length: '',
  breadth: '',
  height: '',
  material: '',
  finish: '',
  costPerUnit: '',
  isFragile: false,
  assemblyRequired: false,
  notes: '',
  customAttribute: '',
});

const createAttribute = (): ProductionItemAttribute => ({
  id: createId(),
  name: '',
  value: '',
});

function SectionHeader({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  action,
}: {
  title: string;
  icon: typeof FileText;
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

export function ItemRegisterForm({ itemCode, onBack, onSave }: ItemRegisterFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const specInputRef = useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    basic: true,
    components: true,
    specFiles: true,
    attributes: false,
  });
  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [components, setComponents] = useState<ProductionItemComponent[]>([]);
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
  const [specFiles, setSpecFiles] = useState<ProductionItemSpecFile[]>([]);
  const [attributes, setAttributes] = useState<ProductionItemAttribute[]>([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const {
    control,
    formState: { errors, isDirty: formIsDirty },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      name: '',
      type: 'component',
      category: '',
      productionSource: 'outsourced',
      manufacturer: 'none',
      quantity: '0',
      unit: 'pcs',
      currency: 'inr',
      description: '',
      itemPrice: '',
      isManualPrice: false,
      productionNotes: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    const hasUnsavedChanges =
      formIsDirty ||
      imageUrl !== '' ||
      components.length > 0 ||
      specFiles.length > 0 ||
      attributes.length > 0;
    setIsDirty(hasUnsavedChanges);
  }, [formIsDirty, imageUrl, components.length, specFiles.length, attributes.length]);

  const isManualPrice = watch('isManualPrice');

  const name = useWatch({ control, name: 'name' }) ?? '';
  const itemPreviewName = useMemo(
    () => name.trim() || `Production item ${itemCode}`,
    [itemCode, name],
  );

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const toggleSection = (section: SectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const openSection = (section: SectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [section]: true,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl(URL.createObjectURL(file));
    setImageName(file.name);
  };

  const handleSpecFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setSpecFiles((current) => [
      ...current,
      ...files.map((file) => ({
        id: createId(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
      })),
    ]);
    openSection('specFiles');
    event.target.value = '';
  };

  const handleComponentChange = (
    id: string,
    field: keyof ProductionItemComponent,
    value: string | number | boolean,
  ) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === id
          ? {
              ...component,
              [field]: value,
            }
          : component,
      ),
    );
  };

  const toggleComponentExpanded = (id: string) => {
    setExpandedComponents((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const handleAttributeChange = (
    id: string,
    field: keyof ProductionItemAttribute,
    value: string,
  ) => {
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.id === id ? { ...attribute, [field]: value } : attribute,
      ),
    );
  };

  const handleAddComponent = () => {
    const newComponent = createComponent();
    setComponents((current) => [...current, newComponent]);
    setExpandedComponents((current) => ({
      ...current,
      [newComponent.id]: true,
    }));
    openSection('components');
  };

  const handleAddAttribute = () => {
    setAttributes((current) => [...current, createAttribute()]);
    openSection('attributes');
  };

  const handleSave = handleSubmit(
    (values) => {
      onSave({
        code: itemCode,
        name: values.name.trim(),
        description: values.description?.trim(),
        type: values.type,
        unit: values.unit,
        category: values.category?.trim(),
        productionSource: values.productionSource || undefined,
        manufacturer: values.manufacturer,
        quantity: values.quantity ? Number(values.quantity) : 0,
        currency: values.currency || undefined,
        itemPrice: values.itemPrice?.trim(),
        isManualPrice: values.isManualPrice,
        productionNotes: values.productionNotes?.trim(),
        imageUrl,
        components: components.filter((component) => component.name.trim()),
        specFiles,
        attributes: attributes.filter((attribute) => attribute.name.trim()),
      });
    },
    (validationErrors) => {
      openSection('basic');
      if (validationErrors.name) {
        toast.error('Validation Error', {
          description: validationErrors.name.message || 'Name is required',
          icon: <AlertCircle className="size-4 text-red-500" />,
          style: {
            borderLeft: '4px solid #ef4444',
          },
        });
      }
    },
  );

  return (
    <form
      className="flex h-screen flex-col overflow-hidden bg-white"
      onSubmit={handleSave}
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
            onClick={() => {
              if (isDirty) {
                setShowUnsavedDialog(true);
              } else {
                onBack();
              }
            }}
            aria-label="Close item form"
            className="size-10 text-gray-950 hover:bg-gray-100"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
          <div className="flex flex-col gap-4">
            <section className="space-y-4">
              <SectionHeader
                title="Basic Details"
                icon={FileText}
                isOpen={openSections.basic}
                onToggle={() => toggleSection('basic')}
              />
              {openSections.basic ? (
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="grid gap-x-4 gap-y-5 md:grid-cols-3">
                    {basicDetailsFields.map((field) => {
                      const fieldId = `item-${field.name}`;
                      const error = errors[field.name]?.message;

                      return (
                        <div
                          key={field.name}
                          className={cn(
                            'space-y-1.5',
                            field.span === 2 && 'md:col-span-2',
                            field.span === 3 && 'md:col-span-3',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <Label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-0.5">*</span>}
                            </Label>
                            {field.hasToggle && field.toggleLabel && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{field.toggleLabel}</span>
                                <Controller
                                  control={control}
                                  name="isManualPrice"
                                  render={({ field: switchField }) => (
                                    <Switch
                                      checked={switchField.value}
                                      onCheckedChange={switchField.onChange}
                                      className="data-[state=checked]:bg-blue-600"
                                    />
                                  )}
                                />
                              </div>
                            )}
                          </div>
                          {field.type === 'select' ? (
                            <Controller
                              control={control}
                              name={
                                field.name as
                                  | 'type'
                                  | 'productionSource'
                                  | 'unit'
                                  | 'currency'
                                  | 'manufacturer'
                              }
                              render={({ field: selectField }) => (
                                <Select
                                  value={selectField.value}
                                  onValueChange={selectField.onChange}
                                >
                                  <SelectTrigger
                                    id={fieldId}
                                    aria-invalid={Boolean(error)}
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  >
                                    <SelectValue placeholder={field.placeholder} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="text-sm"
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              id={fieldId}
                              aria-invalid={Boolean(error)}
                              placeholder={field.placeholder}
                              rows={field.rows ?? 3}
                              className={cn(
                                'rounded-md border-gray-300 bg-white px-3 py-2 text-sm resize-none',
                                field.rows === 1 ? 'min-h-[40px] h-10' : 'min-h-[80px]',
                                field.name === 'productionNotes' &&
                                  !isManualPrice &&
                                  'bg-gray-50 text-gray-400',
                              )}
                              disabled={field.name === 'productionNotes' && !isManualPrice}
                              {...register(field.name)}
                            />
                          ) : (
                            <Input
                              id={fieldId}
                              type={field.type}
                              min={field.min}
                              max={field.max}
                              aria-invalid={Boolean(error)}
                              placeholder={
                                field.name === 'itemPrice' &&
                                isManualPrice &&
                                field.placeholderEnabled
                                  ? field.placeholderEnabled
                                  : field.placeholder
                              }
                              disabled={field.name === 'itemPrice' && !isManualPrice}
                              className={cn(
                                'h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm',
                                field.name === 'itemPrice' &&
                                  !isManualPrice &&
                                  'bg-gray-50 text-gray-400',
                              )}
                              {...register(field.name)}
                            />
                          )}
                          {error ? (
                            <p className="text-xs font-medium text-red-600">{error}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Components & Dimensions"
                icon={Box}
                isOpen={openSections.components}
                onToggle={() => toggleSection('components')}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddComponent}
                    className="h-10 gap-2 rounded-md border-gray-200 bg-white px-4 text-base font-semibold text-gray-950 hover:bg-gray-50"
                  >
                    <Plus className="size-4" />
                    Add Component
                  </Button>
                }
              />
              {openSections.components ? (
                <div className="space-y-4">
                  {components.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
                      <p className="text-sm text-gray-500">No components added yet.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddComponent}
                        className="mt-4 h-10 gap-2 rounded-md border-gray-200 bg-white px-4 text-sm font-medium text-gray-950 hover:bg-gray-50"
                      >
                        <Plus className="size-4" />
                        Add First Component
                      </Button>
                    </div>
                  ) : (
                    components.map((component, index) => {
                      const isExpanded = expandedComponents[component.id] ?? false;
                      const displayName = component.name.trim() || 'Untitled Component';

                      return (
                        <div
                          key={component.id}
                          className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                        >
                          {/* Component Header */}
                          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {displayName}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                Qty: {component.quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Remove component"
                                onClick={() =>
                                  setComponents((current) =>
                                    current.filter((item) => item.id !== component.id),
                                  )
                                }
                                className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                              <button
                                type="button"
                                onClick={() => toggleComponentExpanded(component.id)}
                                className="flex size-8 items-center justify-center rounded-md hover:bg-gray-100"
                              >
                                <ChevronDown
                                  className={cn(
                                    'size-4 text-gray-600 transition-transform',
                                    isExpanded && 'rotate-180',
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Component Form */}
                          {isExpanded && (
                            <div className="p-5">
                              <div className="grid gap-x-4 gap-y-5 md:grid-cols-3">
                                {/* Name */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Name <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    value={component.name}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'name',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Component name"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Qty */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">Qty</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={component.quantity}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'quantity',
                                        parseInt(event.target.value) || 1,
                                      )
                                    }
                                    placeholder="1"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Shape */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">Shape</Label>
                                  <Select
                                    value={component.shape}
                                    onValueChange={(value) =>
                                      handleComponentChange(component.id, 'shape', value)
                                    }
                                  >
                                    <SelectTrigger className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="box">Box (L x B x H)</SelectItem>
                                      <SelectItem value="cylinder">Cylinder (R x H)</SelectItem>
                                      <SelectItem value="sphere">Sphere (R)</SelectItem>
                                      <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Length */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Length
                                  </Label>
                                  <Input
                                    value={component.length}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'length',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="L"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Breadth */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Breadth
                                  </Label>
                                  <Input
                                    value={component.breadth}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'breadth',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="B"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Height */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Height
                                  </Label>
                                  <Input
                                    value={component.height}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'height',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="H"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Material */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Material
                                  </Label>
                                  <Input
                                    value={component.material}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'material',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="e.g., Brass, Iron"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Finish */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Finish
                                  </Label>
                                  <Input
                                    value={component.finish}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'finish',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="e.g., Polished, Matte"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>

                                {/* Cost per unit */}
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Cost per unit
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={component.costPerUnit}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'costPerUnit',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="0.00"
                                    className="h-10 rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>
                              </div>

                              {/* Toggles */}
                              <div className="mt-5 flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={component.isFragile}
                                    onCheckedChange={(checked) =>
                                      handleComponentChange(component.id, 'isFragile', checked)
                                    }
                                    className="data-[state=checked]:bg-blue-600"
                                  />
                                  <Label className="text-sm font-medium text-gray-900">
                                    Fragile
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={component.assemblyRequired}
                                    onCheckedChange={(checked) =>
                                      handleComponentChange(
                                        component.id,
                                        'assemblyRequired',
                                        checked,
                                      )
                                    }
                                    className="data-[state=checked]:bg-blue-600"
                                  />
                                  <Label className="text-sm font-medium text-gray-900">
                                    Assembly Required
                                  </Label>
                                </div>
                              </div>

                              {/* Notes and Custom Attribute */}
                              <div className="mt-5 grid gap-x-4 gap-y-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">Notes</Label>
                                  <Textarea
                                    value={component.notes}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'notes',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Component notes..."
                                    rows={1}
                                    className="min-h-[40px] resize-none rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-gray-900">
                                    Custom Attribute
                                  </Label>
                                  <Textarea
                                    value={component.customAttribute}
                                    onChange={(event) =>
                                      handleComponentChange(
                                        component.id,
                                        'customAttribute',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Optional custom field"
                                    rows={1}
                                    className="min-h-[40px] resize-none rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : null}
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Spec Files"
                icon={FileText}
                isOpen={openSections.specFiles}
                onToggle={() => toggleSection('specFiles')}
              />
              {openSections.specFiles ? (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <input
                    ref={specInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleSpecFilesChange}
                  />
                  {specFiles.length > 0 ? (
                    <div className="space-y-2">
                      {specFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                        >
                          <span className="truncate font-medium text-gray-800">
                            {file.fileName}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remove spec file"
                            onClick={() =>
                              setSpecFiles((current) =>
                                current.filter((item) => item.id !== file.id),
                              )
                            }
                            className="size-8 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10">
                      <FileText className="size-8 text-gray-500" strokeWidth={1.5} />
                      <p className="mt-3 text-sm text-gray-500">
                        Save the item first to upload spec files.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </section>

            <section className="w-full mb-6">
              <SectionHeader
                title="Dynamic Attributes"
                icon={Settings}
                isOpen={openSections.attributes}
                onToggle={() => toggleSection('attributes')}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleAddAttribute();
                    }}
                    className="h-9 gap-2 rounded-md border-gray-200 bg-white px-3 text-sm font-semibold text-gray-950 hover:bg-gray-50 shrink-0"
                  >
                    <Plus className="size-4" />
                    Add Attribute
                  </Button>
                }
              />
              {openSections.attributes ? (
                <div className="mt-3 w-full rounded-lg border border-gray-200 bg-white p-4 overflow-visible min-h-fit">
                  {attributes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-6">
                      <p className="text-sm text-gray-500">
                        No attributes yet. Add custom properties like Grade, Origin, Purity,
                        Thickness...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pr-1 py-3 px-4 flex flex-col gap-3 overflow-visible">
                      {attributes.map((attribute) => (
                        <div key={attribute.id} className="flex items-center gap-3 w-full">
                          <Input
                            value={attribute.name}
                            onChange={(event) =>
                              handleAttributeChange(attribute.id, 'name', event.target.value)
                            }
                            placeholder={
                              dynamicAttributesFields[0]?.placeholder || 'Key (e.g. Grade)'
                            }
                            className="h-10 w-[40%] min-w-0 rounded-md border-gray-300 bg-white px-3 py-2 text-sm box-border"
                          />
                          <Input
                            value={attribute.value}
                            onChange={(event) =>
                              handleAttributeChange(attribute.id, 'value', event.target.value)
                            }
                            placeholder={
                              dynamicAttributesFields[1]?.placeholder || 'Value (e.g. A+)'
                            }
                            className="h-10 w-[50%] min-w-0 rounded-md border-gray-300 bg-white px-3 py-2 text-sm box-border"
                          />
                          <button
                            type="button"
                            aria-label="Remove attribute"
                            onClick={() =>
                              setAttributes((current) =>
                                current.filter((item) => item.id !== attribute.id),
                              )
                            }
                            className="flex h-10 w-[10%] min-w-[40px] max-w-[50px] items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
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
          </div>
        </div>

        <aside className="w-[320px] shrink-0 h-full border-l border-gray-200 bg-white px-4 py-4 overflow-y-auto">
          <h2 className="mb-4 text-base font-semibold text-gray-950">Item Image</h2>
          <div className="relative flex aspect-[1.42] items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white">
            {imageUrl ? (
              <>
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  <Star className="size-3 fill-slate-600 text-slate-600" />
                  Primary
                </div>
                <img src={imageUrl} alt={itemPreviewName} className="size-full object-cover" />
              </>
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
            disabled={!imageUrl}
            className="mt-3 h-10 w-full gap-2 rounded-md border-gray-200 text-base font-semibold"
          >
            <Sparkles className="size-4" />
            Smart AI Auto Fill
          </Button>
        </aside>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Unsaved Changes
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                You have unsaved changes to this item. Are you sure you want to leave? Your changes
                will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUnsavedDialog(false)}
                className="h-9 px-4 text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowUnsavedDialog(false);
                  onBack();
                }}
                className="h-9 px-4 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
              >
                Leave Without Saving
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </form>
  );
}
