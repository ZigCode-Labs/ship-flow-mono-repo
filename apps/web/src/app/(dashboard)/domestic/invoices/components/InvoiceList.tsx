'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, ReceiptText } from 'lucide-react';
import { Invoice } from '../types';
import { InvoiceCard } from './InvoiceCard';

interface InvoiceListProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  creditNoteInvoiceNumbers?: string[];
  onSelectInvoice: (invoice: Invoice) => void;
  onNewInvoice: () => void;
}

export function InvoiceList({
  invoices,
  selectedInvoice,
  creditNoteInvoiceNumbers = [],
  onSelectInvoice,
  onNewInvoice,
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedInvoices = useMemo(() => {
    const invoiceList = Array.isArray(invoices) ? invoices : [];
    const result = invoiceList.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.customerGstin &&
          invoice.customerGstin.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });

    result.sort((a, b) => {
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });

    return result;
  }, [invoices, searchQuery]);

  return (
    <div className="flex h-screen w-[350px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <ReceiptText className="size-[18px] shrink-0 text-blue-600" strokeWidth={2} />
            <h1 className="truncate text-[18px] font-semibold text-slate-950">Tax Invoices</h1>
          </div>
          <Button
            onClick={onNewInvoice}
            size="sm"
            className="h-9 rounded-md bg-blue-600 px-4 text-[14px] font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="mr-1.5 size-4" />
            New
          </Button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-[14px] text-slate-800 shadow-none outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="flex flex-col items-center px-8 pt-8 text-center">
            <ReceiptText className="mb-4 size-11 text-slate-300" strokeWidth={2.4} />
            <h3 className="mb-1 text-[15px] font-semibold text-slate-600">No tax invoices yet</h3>
            <p className="max-w-[240px] text-[14px] leading-6 text-slate-400">
              Create a new invoice or convert from proforma
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {filteredAndSortedInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                isSelected={selectedInvoice?.id === invoice.id}
                hasCreditNote={creditNoteInvoiceNumbers.includes(invoice.invoiceNumber)}
                onClick={() => onSelectInvoice(invoice)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
