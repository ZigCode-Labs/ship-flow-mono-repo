'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface DocumentEmailDialogValues {
  recipientEmail: string;
  subject: string;
  message: string;
}

interface DocumentEmailDialogProps {
  open: boolean;
  title: string;
  values: DocumentEmailDialogValues;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DocumentEmailDialogValues) => Promise<void> | void;
}

export function DocumentEmailDialog({
  open,
  title,
  values,
  submitting = false,
  onOpenChange,
  onSubmit,
}: DocumentEmailDialogProps) {
  const [formValues, setFormValues] = useState<DocumentEmailDialogValues>(values);
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentEmailDialogValues, string>>>(
    {},
  );

  useEffect(() => {
    if (open) {
      setFormValues(values);
      setErrors({});
    }
  }, [open, values]);

  const handleFieldChange = (field: keyof DocumentEmailDialogValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof DocumentEmailDialogValues, string>> = {};
    if (!formValues.recipientEmail.trim()) {
      nextErrors.recipientEmail = 'Recipient email is required';
    }
    if (!formValues.subject.trim()) {
      nextErrors.subject = 'Subject is required';
    }
    if (!formValues.message.trim()) {
      nextErrors.message = 'Message is required';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      recipientEmail: formValues.recipientEmail.trim(),
      subject: formValues.subject.trim(),
      message: formValues.message.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-slate-700" />
            <DialogTitle className="text-[15px] font-semibold text-slate-950">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formValues.recipientEmail}
              onChange={(event) => handleFieldChange('recipientEmail', event.target.value)}
              placeholder="buyer@example.com"
              className="h-10 bg-white"
            />
            {errors.recipientEmail ? (
              <p className="text-xs text-red-500">{errors.recipientEmail}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Subject</label>
            <Input
              value={formValues.subject}
              onChange={(event) => handleFieldChange('subject', event.target.value)}
              placeholder="Delivery Challan DC-26-27-002"
              className="h-10 bg-white"
            />
            {errors.subject ? <p className="text-xs text-red-500">{errors.subject}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Message</label>
            <Textarea
              value={formValues.message}
              onChange={(event) => handleFieldChange('message', event.target.value)}
              placeholder="Please find attached the delivery challan..."
              className="min-h-[96px] resize-y bg-white"
            />
            {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-24 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
