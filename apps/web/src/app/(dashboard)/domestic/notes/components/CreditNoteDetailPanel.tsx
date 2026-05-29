'use client';

import { useState } from 'react';
import { CircleX, Download, Edit, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditNotePreview } from '@/app/(dashboard)/domestic/notes/components/CreditNotePreview';
import type { CreditNote } from '@/app/(dashboard)/domestic/notes/types';
import { SendCreditNoteEmailDialog } from '@/components/credit-note/SendCreditNoteEmailDialog';

interface CreditNoteDetailPanelProps {
  creditNote: CreditNote | null;
  isCreatingNew: boolean;
  onCancelForm: () => void;
  onDownloadPDF: (creditNote: CreditNote) => void;
  onSendEmail?: (creditNote: CreditNote) => void;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-8 text-center">
      <FileText className="mb-4 size-14 text-gray-300" strokeWidth={1.5} />
      <p className="text-sm text-gray-400">Select a credit note to view details</p>
    </div>
  );
}

export function CreditNoteDetailPanel({
  creditNote,
  isCreatingNew,
  onCancelForm,
  onDownloadPDF,
  onSendEmail,
}: CreditNoteDetailPanelProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  if (isCreatingNew) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">New Credit Note</h2>
          <button onClick={onCancelForm} className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-500">Credit note form coming soon...</p>
        </div>
      </div>
    );
  }

  if (!creditNote) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="flex h-full min-w-0 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-[75px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="truncate text-[21px] font-bold text-gray-950">
            {creditNote.creditNoteNumber}
          </h2>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-[5px] border-gray-200 px-3 text-[14px] font-semibold text-black"
              onClick={() => onDownloadPDF(creditNote)}
            >
              <Download data-icon="inline-start" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-[5px] border-purple-200 px-3 text-[14px] font-semibold text-purple-700"
              onClick={() => setIsEmailDialogOpen(true)}
            >
              <Mail data-icon="inline-start" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-[5px] border-gray-200 px-3 text-[14px] font-semibold text-black"
            >
              <Edit data-icon="inline-start" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-[5px] border-gray-200 px-3 text-[14px] font-semibold text-red-600"
            >
              <CircleX data-icon="inline-start" />
              Void
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <CreditNotePreview creditNote={creditNote} />
        </div>
      </div>

      <SendCreditNoteEmailDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        creditNote={creditNote}
        onSent={() => onSendEmail?.(creditNote)}
      />
    </>
  );
}
