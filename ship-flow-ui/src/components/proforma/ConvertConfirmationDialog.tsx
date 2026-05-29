'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConvertConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConvertConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConvertConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-2xl p-6 bg-white border border-slate-100 shadow-xl select-none">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
            Convert to Tax Invoice
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-normal leading-relaxed">
            Convert this proforma to a Tax Invoice? This will create a new tax invoice based on this
            proforma.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 h-10 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 rounded-lg cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer text-xs"
          >
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
