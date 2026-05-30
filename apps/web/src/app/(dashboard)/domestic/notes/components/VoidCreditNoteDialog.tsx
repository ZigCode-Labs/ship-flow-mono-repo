'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CreditNote } from '@/app/(dashboard)/domestic/notes/types';

interface VoidCreditNoteDialogProps {
  creditNote: CreditNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoid: (creditNote: CreditNote) => void;
}

export function VoidCreditNoteDialog({
  creditNote,
  open,
  onOpenChange,
  onVoid,
}: VoidCreditNoteDialogProps) {
  const handleVoid = () => {
    if (!creditNote) return;
    onVoid(creditNote);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!creditNote) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[440px] rounded-xl border-0 bg-white p-8 shadow-xl">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-gray-950">
            Void Credit Note
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-gray-500">
            Are you sure you want to void this credit note? This action cannot be undone and will
            mark the document as invalid.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-8 flex justify-end gap-3 sm:justify-end">
          <Button
            variant="outline"
            size="default"
            className="h-11 rounded-lg border-gray-200 px-6 text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="default"
            className="h-11 rounded-lg bg-red-600 px-6 text-base font-semibold text-white hover:bg-red-700"
            onClick={handleVoid}
          >
            Confirm Void
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}