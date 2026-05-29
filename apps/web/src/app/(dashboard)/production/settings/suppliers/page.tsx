'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, MapPin, Pencil, Plus, Search, Trash2, Upload, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard, StatCardsGrid } from '@/components/ui/stat-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { INDIAN_STATES } from '@/lib/india';
import { cn } from '@/lib/utils';
import supplierFormConfig from './data/supplier-form-fields.json';

const supplierSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  companyName: z.string().optional(),
  supplierType: z.string().optional(),
  phoneCountryCode: z.string().min(1, 'Code is required'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Must be 6 digits'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  designation: z.string().optional(),
  gstin: z
    .string()
    .regex(/^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})?$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email'),
  notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;
type SupplierFieldName = keyof SupplierFormValues;

type SupplierFormOption = {
  value: string;
  label: string;
};

type SupplierFormField = {
  name: SupplierFieldName;
  label: string;
  type: 'email' | 'phone' | 'select' | 'text' | 'textarea';
  required: boolean;
  placeholder: string;
  layout: 'full' | 'half';
  maxLength?: number;
  rows?: number;
  options?: SupplierFormOption[];
  optionsSource?: 'indianStates';
};

type SupplierFormConfig = {
  title: string;
  description: string;
  uploadAction: {
    buttonText: string;
    helperText: string;
  };
  fields: SupplierFormField[];
};

interface Supplier extends SupplierFormValues {
  id: string;
}

const supplierForm = supplierFormConfig as SupplierFormConfig;

const EMPTY_FORM: SupplierFormValues = {
  contactName: '',
  companyName: '',
  supplierType: '',
  phoneCountryCode: '+91',
  phone: '',
  country: 'India',
  pincode: '',
  city: '',
  state: '',
  address: '',
  contactPerson: '',
  designation: '',
  gstin: '',
  email: '',
  notes: '',
};

const inputClassName = 'h-10 rounded-[5px] border border-border bg-background text-sm';

const getFieldOptions = (field: SupplierFormField): SupplierFormOption[] => {
  if (field.optionsSource === 'indianStates') {
    return INDIAN_STATES.map((state) => ({ value: state, label: state }));
  }

  return field.options ?? [];
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: EMPTY_FORM,
  });

  const handleAdd = () => {
    setEditingId(null);
    reset(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    reset(supplier);
    setDialogOpen(true);
  };

  const onSubmit = (data: SupplierFormValues) => {
    if (editingId) {
      setSuppliers((prev) =>
        prev.map((supplier) => (supplier.id === editingId ? { ...supplier, ...data } : supplier)),
      );
      toast.success('Supplier updated');
    } else {
      setSuppliers((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
      toast.success('Supplier added');
    }

    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== deleteId));
    setDeleteId(null);
    toast.success('Supplier removed');
  };

  const renderField = (field: SupplierFormField) => {
    const fieldError = errors[field.name]?.message;
    const fieldId = `supplier-${field.name}`;
    const layoutClassName = field.layout === 'half' ? 'sm:col-span-1' : 'sm:col-span-2';

    if (field.type === 'phone') {
      return (
        <div key={field.name} className={cn('flex flex-col gap-1.5', layoutClassName)}>
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {field.label} {field.required ? <span className="text-destructive">*</span> : null}
          </Label>
          <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-2">
            <Input
              {...register('phoneCountryCode')}
              aria-label="Phone country code"
              className={inputClassName}
            />
            <Input
              id={fieldId}
              {...register('phone')}
              placeholder={field.placeholder}
              className={inputClassName}
            />
          </div>
          {fieldError ? <p className="text-[11px] text-destructive">{fieldError}</p> : null}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name} className={cn('flex flex-col gap-1.5', layoutClassName)}>
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {field.label} {field.required ? <span className="text-destructive">*</span> : null}
          </Label>
          <Controller
            control={control}
            name={field.name}
            render={({ field: controllerField }) => (
              <Select
                value={String(controllerField.value ?? '')}
                onValueChange={controllerField.onChange}
              >
                <SelectTrigger id={fieldId} className={inputClassName}>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {getFieldOptions(field).map((option: SupplierFormOption) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {fieldError ? <p className="text-[11px] text-destructive">{fieldError}</p> : null}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className={cn('flex flex-col gap-1.5', layoutClassName)}>
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {field.label} {field.required ? <span className="text-destructive">*</span> : null}
          </Label>
          <Textarea
            id={fieldId}
            {...register(field.name)}
            placeholder={field.placeholder}
            rows={field.rows}
            className="min-h-20 resize-none rounded-[5px] border border-border bg-background text-sm"
          />
          {fieldError ? <p className="text-[11px] text-destructive">{fieldError}</p> : null}
        </div>
      );
    }

    return (
      <div key={field.name} className={cn('flex flex-col gap-1.5', layoutClassName)}>
        <Label htmlFor={fieldId} className="text-xs font-medium">
          {field.label} {field.required ? <span className="text-destructive">*</span> : null}
        </Label>
        <Input
          id={fieldId}
          type={field.type}
          {...register(field.name)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className={cn(inputClassName, field.name === 'gstin' && 'uppercase')}
        />
        {fieldError ? <p className="text-[11px] text-destructive">{fieldError}</p> : null}
      </div>
    );
  };

  const totalSuppliers = suppliers.length;
  const citiesCount = new Set(suppliers.map((supplier) => supplier.city).filter(Boolean)).size;
  const withEmailCount = suppliers.filter((supplier) => supplier.email).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your supplier contacts for purchase orders.
          </p>
        </div>
        <Button size="lg" className="min-w-40 gap-1.5 rounded-[5px]" onClick={handleAdd}>
          <Plus data-icon="inline-start" />
          Add Supplier
        </Button>
      </div>

      <StatCardsGrid className="lg:grid-cols-3">
        <StatCard label="Total Suppliers" value={totalSuppliers} icon={Users} variant="blue" />
        <StatCard label="Cities" value={citiesCount} icon={MapPin} variant="green" />
        <StatCard label="With Email" value={withEmailCount} icon={Mail} variant="orange" />
      </StatCardsGrid>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search suppliers by name, company, email, or city..."
          className="rounded-[5px] pl-9"
        />
      </div>

      {suppliers.length === 0 ? (
        <EmptyState
          title="No Suppliers Yet"
          description="Add your first supplier to get started"
          buttonText="Add Supplier"
          icon={Building2}
          onAdd={handleAdd}
        />
      ) : (
        <div className="overflow-hidden rounded-[5px] border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>COMPANY</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>CONTACT PERSON</TableHead>
                <TableHead>LOCATION</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>CONTACT</TableHead>
                <TableHead className="w-24">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="font-medium">
                      {supplier.companyName || supplier.contactName}
                    </div>
                    <div className="text-sm text-muted-foreground">{supplier.contactName}</div>
                  </TableCell>
                  <TableCell>
                    {supplier.supplierType ? (
                      <Badge variant="outline" className="rounded-[5px] capitalize">
                        {supplier.supplierType}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{supplier.contactPerson || '-'}</TableCell>
                  <TableCell>
                    {[supplier.city, supplier.state].filter(Boolean).join(', ') || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{supplier.gstin || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="size-3.5" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="text-xs">📞</span>
                          <span>
                            {[supplier.phoneCountryCode, supplier.phone].filter(Boolean).join(' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-[5px]"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-[5px] text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(supplier.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92vh] max-w-[560px] flex-col overflow-hidden rounded-[5px] p-0">
          <DialogHeader className="border-b border-border px-5 pb-3 pt-4">
            <DialogTitle className="text-base">
              {editingId ? 'Edit Supplier' : supplierForm.title}
            </DialogTitle>
            <DialogDescription className="text-xs">{supplierForm.description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
              <div className="mb-4 flex flex-col gap-2 rounded-[5px] border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center">
                <Button type="button" variant="outline" size="sm" className="rounded-[5px]">
                  <Upload data-icon="inline-start" />
                  {supplierForm.uploadAction.buttonText}
                </Button>
                <p className="text-xs text-primary">{supplierForm.uploadAction.helperText}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {supplierForm.fields.map((field) => renderField(field))}
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border px-5 py-4 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-[5px]"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-[5px]">
                {editingId ? 'Save Changes' : 'Add Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Supplier"
        description={
          <>
            Are you sure you want to delete{' '}
            {suppliers.find((s) => s.id === deleteId)?.companyName ||
              suppliers.find((s) => s.id === deleteId)?.contactName ||
              'this supplier'}
            ? This action cannot be undone.
          </>
        }
        cancelText="Cancel"
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
