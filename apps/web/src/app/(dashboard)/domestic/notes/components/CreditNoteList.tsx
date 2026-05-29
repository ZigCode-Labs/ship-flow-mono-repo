'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FileMinus, FileText, Search } from 'lucide-react';
import type { CreditNote } from '@/app/(dashboard)/domestic/notes/types';

interface CreditNoteListProps {
  creditNotes: CreditNote[];
  selectedCreditNote: CreditNote | null;
  onSelectCreditNote: (creditNote: CreditNote) => void;
  onNewCreditNote: () => void;
}

export function CreditNoteList({
  creditNotes,
  selectedCreditNote,
  onSelectCreditNote,
}: CreditNoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCreditNotes = useMemo(() => {
    if (!searchQuery.trim()) return creditNotes;

    const query = searchQuery.toLowerCase();
    return creditNotes.filter(
      (cn) =>
        cn.creditNoteNumber.toLowerCase().includes(query) ||
        cn.customerName.toLowerCase().includes(query),
    );
  }, [creditNotes, searchQuery]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number): string => {
    return `\u20b9${Math.round(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <aside className="flex h-full w-[306px] min-w-[306px] shrink-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 pb-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileMinus className="size-5 shrink-0 text-red-500" strokeWidth={1.8} />
            <h1 className="text-[18px] font-semibold text-gray-950">Credit Notes</h1>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by CN # or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-[5px] bg-white pl-9 text-[13px] placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredCreditNotes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 pt-16 text-center">
            <FileText className="mb-4 size-12 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-500">No credit notes found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-3 py-7">
            {filteredCreditNotes.map((creditNote) => (
              <button
                key={creditNote.id}
                onClick={() => onSelectCreditNote(creditNote)}
                className={cn(
                  'w-full rounded-[7px] border bg-white px-3 py-4 text-left transition-colors hover:bg-gray-50',
                  selectedCreditNote?.id === creditNote.id &&
                    'border-red-400 bg-red-50 hover:bg-red-50',
                )}
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <span className="pt-0.5 text-[13px] font-medium text-slate-600">
                    {creditNote.creditNoteNumber}
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="h-6 rounded-full bg-emerald-100 px-3 text-[11px] font-medium uppercase text-emerald-700 hover:bg-emerald-100">
                      Issued
                    </Badge>
                    <span className="text-[14px] font-bold text-black">
                      {formatAmount(creditNote.grandTotal)}
                    </span>
                  </div>
                </div>
                <p className="truncate text-[12px] text-slate-400">
                  {formatDate(creditNote.creditNoteDate)} &bull; Inv: {creditNote.invoiceNumber}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
