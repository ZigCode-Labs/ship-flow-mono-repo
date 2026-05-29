'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, MapPin, Pencil, Plus, Search, Trash2, Upload, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import jobWorkerFormConfig from './data/job-worker-form-fields.json';

const jobWorkerSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  companyName: z.string().optional(),
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
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type JobWorkerFormValues = z.infer<typeof jobWorkerSchema>;
type JobWorkerFieldName = keyof JobWorkerFormValues;

type JobWorkerFormOption = {
  value: string;
  label: string;
};

type JobWorkerFormField = {
  name: JobWorkerFieldName;
  label: string;
  type: 'email' | 'locked' | 'phone' | 'select' | 'text' | 'textarea';
  required: boolean;
  placeholder: string;
  layout: 'full' | 'half';
  maxLength?: number;
  rows?: number;
  options?: JobWorkerFormOption[];
  optionsSource?: 'indianStates';
  lockedValue?: string;
  helperText?: string;
};

type JobWorkerFormConfig = {
  title: string;
  description: string;
  uploadAction: {
    buttonText: string;
    helperText: string;
  };
  fields: JobWorkerFormField[];
};

interface JobWorker extends JobWorkerFormValues {
  id: string;
}

const jobWorkerForm = jobWorkerFormConfig as JobWorkerFormConfig;

const EMPTY_FORM: JobWorkerFormValues = {
  contactName: '',
  companyName: '',
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

const getFieldOptions = (field: JobWorkerFormField): JobWorkerFormOption[] => {
  if (field.optionsSource === 'indianStates') {
    return INDIAN_STATES.map((state) => ({ value: state, label: state }));
  }

  return field.options ?? [];
};

export default function JobWorkersPage() {
  const [workers, setWorkers] = React.useState<JobWorker[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobWorkerFormValues>({
    resolver: zodResolver(jobWorkerSchema),
    defaultValues: EMPTY_FORM,
  });

  const handleAdd = () => {
    setEditingId(null);
    reset(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleEdit = (worker: JobWorker) => {
    setEditingId(worker.id);
    reset(worker);
    setDialogOpen(true);
  };

  const onSubmit = (data: JobWorkerFormValues) => {
    if (editingId) {
      setWorkers((prev) => prev.map((w) => (w.id === editingId ? { ...w, ...data } : w)));
      toast.success('Job worker updated');
    } else {
      setWorkers((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
      toast.success('Job worker added');
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setWorkers((prev) => prev.filter((w) => w.id !== deleteId));
    setDeleteId(null);
    toast.success('Job worker removed');
  };

  const renderField = (field: JobWorkerFormField) => {
    const fieldError = errors[field.name]?.message;
    const fieldId = `jobworker-${field.name}`;
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
                    {getFieldOptions(field).map((option: JobWorkerFormOption) => (
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

    if (field.type === 'locked') {
      return (
        <div key={field.name} className={cn('flex flex-col gap-1.5', layoutClassName)}>
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {field.label}
          </Label>
          <div className="flex items-center gap-3 rounded-[5px] border border-primary/25 bg-primary/5 px-3 py-2">
            <span className="text-sm font-medium text-primary">{field.lockedValue}</span>
            <span className="text-xs text-muted-foreground">{field.helperText}</span>
          </div>
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

  const totalWorkers = workers.length;
  const citiesCount = new Set(workers.map((w) => w.city).filter(Boolean)).size;
  const withEmailCount = workers.filter((w) => w.email).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Job Workers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your job worker contacts for job work orders.
          </p>
        </div>
        <Button size="lg" className="min-w-40 gap-1.5 rounded-[5px]" onClick={handleAdd}>
          <Plus data-icon="inline-start" />
          Add Job Worker
        </Button>
      </div>

      <StatCardsGrid className="lg:grid-cols-3">
        <StatCard label="Total Job Workers" value={totalWorkers} icon={Users} variant="blue" />
        <StatCard label="Cities" value={citiesCount} icon={MapPin} variant="green" />
        <StatCard label="With Email" value={withEmailCount} icon={Mail} variant="orange" />
      </StatCardsGrid>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search job workers by name, company, email, or city..."
          className="rounded-[5px] pl-9"
        />
      </div>

      {workers.length === 0 ? (
        <EmptyState
          title="No Job Workers Yet"
          description="Add your first job worker to get started"
          buttonText="Add Job Worker"
          icon={Building2}
          onAdd={handleAdd}
        />
      ) : (
        <div className="overflow-hidden rounded-[5px] border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Company Name</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City / State</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">
                    {worker.companyName || worker.contactName}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{worker.gstin || '-'}</TableCell>
                  <TableCell>{worker.contactPerson || '-'}</TableCell>
                  <TableCell>
                    {[worker.phoneCountryCode, worker.phone].filter(Boolean).join(' ')}
                  </TableCell>
                  <TableCell>
                    {[worker.city, worker.state].filter(Boolean).join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-[5px]"
                        onClick={() => handleEdit(worker)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-[5px] text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(worker.id)}
                      >
                        <Trash2 />
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
              {editingId ? 'Edit Job Worker' : jobWorkerForm.title}
            </DialogTitle>
            <DialogDescription className="text-xs">{jobWorkerForm.description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
              <div className="mb-4 flex flex-col gap-2 rounded-[5px] border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center">
                <Button type="button" variant="outline" size="sm" className="rounded-[5px]">
                  <Upload data-icon="inline-start" />
                  {jobWorkerForm.uploadAction.buttonText}
                </Button>
                <p className="text-xs text-primary">{jobWorkerForm.uploadAction.helperText}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {jobWorkerForm.fields.map((field) => renderField(field))}
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
                {editingId ? 'Save Changes' : 'Add Job Worker'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm rounded-[5px]">
          <DialogHeader>
            <DialogTitle>Remove Job Worker</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job worker? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-[5px]" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-[5px]" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
