'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, X, Search, Plus, Send, FileText, CheckCircle } from 'lucide-react';
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
import { AddBusinessContactDialog } from '@/components/proforma/AddBusinessContactDialog';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  type: string;
}

const sendEmailSchema = z.object({
  cc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().optional(),
});

type SendEmailFormData = z.infer<typeof sendEmailSchema>;

interface SendInvoiceEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    customerName?: string;
  };
  onSent?: () => void;
}

export function SendInvoiceEmailDialog({
  open,
  onOpenChange,
  invoice,
  onSent,
}: SendInvoiceEmailDialogProps) {
  const [recipients, setRecipients] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [attachPdf, setAttachPdf] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: { subject: '', message: '', cc: '' },
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        subject: `Tax Invoice ${invoice.invoiceNumber}`,
        message: '',
        cc: '',
      });
      setRecipients([]);
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [open, invoice.invoiceNumber, reset]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setHasSearched(true);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await api.get<Contact[]>(
          `/proforma-email/contacts?search=${encodeURIComponent(query)}`,
        );
        const selectedEmails = new Set(recipients.map((r) => r.email.toLowerCase()));
        setSearchResults(results.filter((r) => !selectedEmails.has(r.email.toLowerCase())));
      } catch {
        toast.error('Failed to search contacts');
      } finally {
        setIsSearching(false);
      }
    },
    [recipients],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addRecipient = (contact: Contact) => {
    setRecipients((prev) => [...prev, contact]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const onSubmit = async (formData: SendEmailFormData) => {
    if (recipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setIsSending(true);
    try {
      await api.post('/invoice-email/send', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        recipients: recipients.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          company: r.company,
          type: r.type,
        })),
        cc: formData.cc || undefined,
        subject: formData.subject,
        message: formData.message || undefined,
        attachPdf,
        pdfFileName: `${invoice.invoiceNumber}.pdf`,
      });

      toast.success('Email sent successfully', {
        description: `Tax invoice sent to ${recipients.map((r) => r.name).join(', ')}`,
      });

      onOpenChange(false);
      onSent?.();
    } catch {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleContactAdded = (contact: Contact) => {
    addRecipient(contact);
    setShowAddContact(false);
    toast.success('Contact added and selected');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-700" />
              <DialogTitle className="text-base font-semibold text-slate-800">
                Send Tax Invoice via Email
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              Document {invoice.invoiceNumber} will be attached as PDF
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
            {/* Recipients */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Recipients <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500">
                Search and select buyers, agents, or contacts
              </p>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 text-xs"
                    >
                      <Mail className="h-3 w-3 text-slate-500" />
                      <span className="font-medium text-slate-700">{recipient.name}</span>
                      <span className="text-slate-400">({recipient.email})</span>
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {recipient.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
                        className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative" ref={dropdownRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search buyers, agents, or contacts..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                />

                {hasSearched && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => addRecipient(result)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 truncate">
                              {result.name}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0">
                              {result.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">{result.email}</div>
                          <div className="text-xs text-slate-400">{result.company}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {hasSearched && !isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg px-3 py-2.5 text-sm text-slate-500">
                    No contacts found
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAddContact(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add New Contact
              </button>
            </div>

            {/* Attach PDF */}
            <div className="flex items-start gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
              <input
                type="checkbox"
                id="attachPdfInvoice"
                checked={attachPdf}
                onChange={(e) => setAttachPdf(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="attachPdfInvoice" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-800">
                    Attach PDF: {invoice.invoiceNumber}.pdf
                  </span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5 ml-6">
                  Tax Invoice will be attached to the email
                </p>
              </div>
            </div>

            {/* CC */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                CC (comma-separated)
              </label>
              <input
                type="text"
                {...register('cc')}
                placeholder="cc1@example.com, cc2@example.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('subject')}
                placeholder="Subject line"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.subject && (
                <p className="text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">Message</label>
              <textarea
                {...register('message')}
                placeholder="Email message body (leave blank for auto-generated)"
                rows={5}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 resize-y"
              />
            </div>

            {recipients.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Email Preview Ready</p>
                  <p className="text-xs text-green-600">
                    Ready to send to {recipients[0]?.name}
                    {recipients.length > 1 ? ` and ${recipients.length - 1} more` : ''}.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-xs font-medium"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSending || recipients.length === 0}
                className="h-9 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddBusinessContactDialog
        open={showAddContact}
        onOpenChange={setShowAddContact}
        onContactAdded={handleContactAdded}
      />
    </>
  );
}
