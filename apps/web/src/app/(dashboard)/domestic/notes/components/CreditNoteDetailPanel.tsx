'use client';

import { useState } from 'react';
import { AlertCircle, CircleX, Download, Edit, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditNotePreview } from '@/app/(dashboard)/domestic/notes/components/CreditNotePreview';
import { VoidCreditNoteDialog } from '@/app/(dashboard)/domestic/notes/components/VoidCreditNoteDialog';
import type { CreditNote } from '@/app/(dashboard)/domestic/notes/types';
import { SendCreditNoteEmailDialog } from '@/components/credit-note/SendCreditNoteEmailDialog';

interface CreditNoteDetailPanelProps {
  creditNote: CreditNote | null;
  isCreatingNew: boolean;
  onCancelForm: () => void;
  onDownloadPDF: (creditNote: CreditNote) => void;
  onSendEmail?: (creditNote: CreditNote) => void;
  onVoid?: (creditNote: CreditNote) => void;
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
  onVoid,
}: CreditNoteDetailPanelProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);

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
            {creditNote.status !== 'voided' && (
              <>
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
                  onClick={() => setIsVoidDialogOpen(true)}
                >
                  <CircleX data-icon="inline-start" />
                  Void
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {creditNote.status === 'voided' && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div>
                <p className="text-[15px] font-semibold text-red-700">This Credit Note is VOID</p>
                <p className="mt-0.5 text-[13px] text-red-600">
                  This document is no longer valid for accounting purposes.
                </p>
              </div>
            </div>
          )}
          <CreditNotePreview creditNote={creditNote} isVoided={creditNote.status === 'voided'} />
        </div>
      </div>

      <SendCreditNoteEmailDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        creditNote={creditNote}
        onSent={() => onSendEmail?.(creditNote)}
      />

      <VoidCreditNoteDialog
        creditNote={creditNote}
        open={isVoidDialogOpen}
        onOpenChange={setIsVoidDialogOpen}
        onVoid={(cn) => onVoid?.(cn)}
      />
    </>
  );
}
