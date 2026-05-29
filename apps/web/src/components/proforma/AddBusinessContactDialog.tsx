'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Info, AlertTriangle, User, Mail, Phone, Building, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shipflow/ui';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

const addContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type AddContactFormData = z.infer<typeof addContactSchema>;

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  type: string;
}

interface AddBusinessContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactAdded?: (contact: Contact) => void;
}

export function AddBusinessContactDialog({
  open,
  onOpenChange,
  onContactAdded,
}: AddBusinessContactDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddContactFormData>({
    resolver: zodResolver(addContactSchema),
  });

  const onSubmit = async (data: AddContactFormData) => {
    try {
      const result = await api.post<{ id: string; email: string; name: string | null; company: string | null }>(
        '/proforma-email/contacts',
        data,
      );

      const contact: Contact = {
        id: result.id,
        name: result.name || data.name,
        email: result.email,
        company: result.company || data.company || '',
        type: 'Contact',
      };

      toast.success('Contact added successfully');
      reset();
      onContactAdded?.(contact);
      onOpenChange(false);
    } catch {
      toast.error('Failed to add contact');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base font-semibold text-slate-800">
            Add Business Contact
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            Quickly add a business contact - they&apos;ll be available for selection immediately
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
          {/* Info box */}
          <div className="flex items-start gap-2 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              Add a new business contact to quickly select them as an email recipient
            </p>
          </div>

          {/* Warning box */}
          <div className="flex items-start gap-2 p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              For Buyers, Buying Agents, Domestic Buyers, or Shipping Agents, use their dedicated modules to ensure complete data for document workflows.
            </p>
          </div>

          {/* Name & Email row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <User className="h-3.5 w-3.5 text-slate-500" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="John Smith"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Phone & Company row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Building className="h-3.5 w-3.5 text-slate-500" />
                Company
              </label>
              <input
                type="text"
                {...register('company')}
                placeholder="ABC Customs Brokers"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              placeholder="Additional notes about this contact..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 resize-y"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
