'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Download,
  Edit,
  FileText,
  Mail,
  RotateCcw,
  Search,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Invoice } from '../types';
import { TaxInvoicePreview } from './TaxInvoicePreview';
import { SendInvoiceEmailDialog } from '@/components/invoice/SendInvoiceEmailDialog';

interface InvoiceDetailPanelProps {
  invoice: Invoice | null;
  onBack?: () => void;
  onDownloadPDF?: (invoice: Invoice) => void;
  onSendEmail?: (invoice: Invoice) => void;
  onMarkAsPaid?: (invoice: Invoice) => void;
  onMarkAsSent?: (invoice: Invoice) => void;
  onMarkAsDraft?: (invoice: Invoice) => void;
  onCreateCreditNote?: (invoice: Invoice) => void;
  onCancelInvoice?: (invoice: Invoice, options?: { createCreditNote?: boolean }) => void;
  onReinstateInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
}

const statusLabels: Record<Invoice['status'], string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <FileText className="mb-4 size-12 text-slate-400" strokeWidth={2.4} />
      <h3 className="mb-1 text-[16px] font-semibold text-slate-400">
        Select an invoice to view details
      </h3>
      <p className="text-[14px] text-slate-400">or create a new one</p>
    </div>
  );
}

function formatDateInput(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return date.toISOString().split('T')[0];
}

function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
  onRecord,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecord: () => void;
}) {
  const total = invoice.grandTotal || invoice.amount || 0;
  const totalTax = invoice.totalTax || 0;
  const today = new Date().toISOString().split('T')[0];

  const handleRecord = () => {
    onRecord();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-[720px] gap-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="px-7 pb-6 pt-7">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Record Payment
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600">
              Record a payment received for an invoice. All required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-10 space-y-7">
            <section className="rounded-lg border border-blue-200 bg-blue-50/70 p-4">
              <h3 className="mb-5 text-sm font-semibold text-blue-900">Select Document</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <Select defaultValue="domestic-invoice">
                    <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic-invoice">Domestic Invoice (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Select Invoice <span className="text-red-500">*</span>
                  </label>
                  <Select defaultValue={invoice.id || invoice.invoiceNumber}>
                    <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={invoice.id || invoice.invoiceNumber}>
                        {invoice.invoiceNumber} - ₹{total.toFixed(2)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
              <h3 className="mb-5 text-sm font-semibold text-emerald-900">Payment Details</h3>
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Amount Received <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                      ₹
                    </span>
                    <Input
                      className="h-11 rounded-md border-slate-200 pl-10 text-sm"
                      defaultValue={total.toFixed(2)}
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-slate-500">Amount received from buyer in INR</p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <h4 className="mb-3 text-sm font-semibold text-amber-900">GST Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">IGST:</span>
                      <span className="font-semibold text-slate-950">₹{totalTax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-amber-200 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Total Tax:</span>
                        <span className="font-semibold text-slate-950">₹{totalTax.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-800">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="h-11 rounded-md border-slate-200 text-sm"
                      type="date"
                      defaultValue={formatDateInput(invoice.invoiceDate)}
                    />
                    <p className="text-sm text-slate-500">Date when payment was sent</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-800">
                      Received Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="h-11 rounded-md border-slate-200 text-sm"
                      type="date"
                      defaultValue={today}
                    />
                    <p className="text-sm text-slate-500">Date when money was credited</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-7">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <Select defaultValue="bank-remittance">
                  <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-remittance">Bank Remittance</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">How the payment was received</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800">Reference Number</label>
                <Input
                  className="h-11 rounded-md border-slate-200 text-sm"
                  placeholder="Enter transaction reference number"
                />
                <p className="text-sm text-slate-500">Optional: Transaction or reference ID</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800">Payment Notes</label>
                <Input
                  className="h-11 rounded-md border-slate-200 text-sm"
                  placeholder="Add any additional notes about this payment"
                />
                <p className="text-sm text-slate-500">
                  Optional: Any additional information or remarks
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 border-t border-slate-100 bg-white px-7 py-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-md px-7 text-sm font-semibold"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleRecord}
            className="h-11 rounded-md bg-emerald-500 px-7 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IssueCreditNoteDialog({
  invoice,
  open,
  onOpenChange,
  onCreate,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}) {
  const creditAmount = invoice.grandTotal || invoice.amount || 0;

  const handleCreate = () => {
    onCreate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] rounded-lg border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="px-6 pb-6 pt-12">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold text-slate-950">
              Issue Credit Note
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Create a credit note for Invoice {invoice.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-11 space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800">Reason for Credit Note</label>
              <Select defaultValue="sales-return">
                <SelectTrigger className="h-10 rounded-md border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales-return">Sales Return</SelectItem>
                  <SelectItem value="price-revision">Price Revision</SelectItem>
                  <SelectItem value="excess-tax-charged">Excess Tax Charged</SelectItem>
                  <SelectItem value="post-sale-discount">Post-Sale Discount</SelectItem>
                  <SelectItem value="order-cancellation">Order Cancellation</SelectItem>
                  <SelectItem value="quality-issue">Quality Issue / Defective Goods</SelectItem>
                  <SelectItem value="short-delivery">Short Delivery / Quantity Mismatch</SelectItem>
                  <SelectItem value="delayed-delivery">Delayed Delivery Penalty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800">Credit Amount</label>
              <Input
                className="h-10 rounded-md border-slate-200 text-sm"
                defaultValue={creditAmount.toFixed(2)}
                max={creditAmount}
                min="0"
                step="0.01"
                type="number"
              />
              <p className="text-xs text-slate-500">
                Enter the amount to credit. Maximum: ₹
                {Math.round(creditAmount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-5 text-sm font-semibold"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCreate}
            className="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Create Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onCancelInvoice,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelInvoice: (createCreditNote: boolean) => void;
}) {
  const [action, setAction] = useState<'credit' | 'cancel'>('credit');
  const creditAmount = invoice.grandTotal || invoice.amount || 0;

  const handleCancelInvoice = () => {
    onCancelInvoice(action === 'credit');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] rounded-lg border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="px-6 pb-6 pt-12">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold text-slate-950">
              Cancel Invoice
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {invoice.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-10 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">Confirm Cancellation</div>
                  <p className="mt-2 max-w-[300px] text-sm leading-5 text-slate-600">
                    This invoice has no payments recorded. Choose an action:
                  </p>
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-4">
              <input
                type="radio"
                checked={action === 'credit'}
                onChange={() => setAction('credit')}
                className="mt-1 h-4 w-4"
              />
              <FileText className="mt-0.5 h-4 w-4 text-blue-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Issue Credit Note
                </span>
                <span className="block text-sm font-semibold leading-5 text-slate-500">
                  Generate a GST-compliant credit note linked to this invoice.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-4">
              <input
                type="radio"
                checked={action === 'cancel'}
                onChange={() => setAction('cancel')}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Just Cancel (No Credit)
                </span>
                <span className="block text-sm leading-5 text-slate-500">
                  Simply mark the invoice as cancelled.
                </span>
              </span>
            </label>

            {action === 'credit' && (
              <div className="border-t border-slate-200 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Reason for Credit Note
                    </label>
                    <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15">
                      <option>Sales Return</option>
                      <option>Price Revision</option>
                      <option>Excess Tax Charged</option>
                      <option>Post-Sale Discount</option>
                      <option>Order Cancellation</option>
                      <option>Quality Issue / Defective Goods</option>
                      <option>Short Delivery / Quantity Mismatch</option>
                      <option>Delayed Delivery Penalty</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Credit Amount</label>
                    <Input
                      className="h-10 rounded-md border-slate-200 text-sm"
                      max={creditAmount}
                      min="0"
                      step="0.01"
                      type="number"
                    />
                    <p className="text-xs text-slate-500">
                      Enter the amount to credit. Maximum: ₹
                      {Math.round(creditAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-5 text-sm font-semibold"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCancelInvoice}
            className="h-10 rounded-md bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onDelete,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[510px] rounded-lg border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="px-6 pb-6 pt-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-lg font-semibold text-slate-950">
              Delete Tax Invoice
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Are you sure you want to delete invoice {invoice.invoiceNumber}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-md px-5 text-sm font-semibold"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleDelete}
              className="h-10 rounded-md bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invoice
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InvoiceDetailPanel({
  invoice,
  onBack,
  onDownloadPDF,
  onSendEmail,
  onMarkAsPaid,
  onMarkAsSent,
  onMarkAsDraft,
  onCreateCreditNote,
  onCancelInvoice,
  onReinstateInvoice,
  onDeleteInvoice,
  onEdit,
}: InvoiceDetailPanelProps) {
  const [busyAction, setBusyAction] = useState<'email' | 'pdf' | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCreditNoteDialogOpen, setIsCreditNoteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!invoice) {
    return <EmptyState />;
  }

  const handleEdit = () => {
    onEdit?.(invoice);
  };

  const handleMarkAsSent = () => {
    onMarkAsSent?.(invoice);
  };

  const handleMarkAsDraft = () => {
    onMarkAsDraft?.(invoice);
  };

  const handleSendEmail = () => {
    setIsEmailDialogOpen(true);
  };

  const handleDownloadPDF = () => {
    setBusyAction('pdf');
    onDownloadPDF?.(invoice);
    setBusyAction(null);
  };

  const handlePayment = () => {
    onMarkAsPaid?.(invoice);
  };

  const handleCreditNote = () => {
    onCreateCreditNote?.(invoice);
  };

  const handleCancelWithOptions = (createCreditNote: boolean) => {
    onCancelInvoice?.(invoice, { createCreditNote });
  };

  const handleReinstateInvoice = () => {
    onReinstateInvoice?.(invoice);
  };

  const handleDeleteInvoice = () => {
    onDeleteInvoice?.(invoice);
  };

  const status = statusLabels[invoice.status];

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-[#f8f9fb]">
      <header className="flex-shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-slate-950">
                {invoice.invoiceNumber || 'N/A'}
              </h1>
              <p className="truncate text-[10px] text-slate-500">
                {invoice.customerName || 'No customer'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={invoice.status === 'cancelled'}
              className="h-7 rounded-sm px-2 text-[10px]"
            >
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            {invoice.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={invoice.status === 'sent' ? handleMarkAsDraft : handleMarkAsSent}
                disabled={invoice.status === 'paid'}
                className="h-7 rounded-sm border-blue-200 px-2 text-[10px] text-blue-700"
              >
                <Send className="mr-1 h-3 w-3" />
                {invoice.status === 'sent' ? 'Mark as Draft' : 'Mark as Sent'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmailDialogOpen(true)}
              disabled={busyAction === 'email' || invoice.status === 'cancelled'}
              className="h-7 rounded-sm border-purple-200 px-2 text-[10px] text-purple-700"
            >
              <Mail className="mr-1 h-3 w-3" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={busyAction === 'pdf'}
              className="h-7 rounded-sm border-emerald-200 px-2 text-[10px] text-emerald-700"
            >
              <Download className="mr-1 h-3 w-3" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaymentDialogOpen(true)}
              disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
              className="h-7 rounded-sm border-teal-200 px-2 text-[10px] text-teal-700"
            >
              <Banknote className="mr-1 h-3 w-3" />
              Payment
            </Button>
            {invoice.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreditNoteDialogOpen(true)}
                className="h-7 rounded-sm border-blue-200 px-2 text-[10px] text-blue-700"
              >
                <FileText className="mr-1 h-3 w-3" />
                Credit Note
              </Button>
            )}
            {invoice.status === 'cancelled' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReinstateInvoice}
                className="h-7 rounded-sm border-green-300 px-2 text-[10px] text-green-700"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reinstate
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={invoice.status === 'paid'}
                className="h-7 rounded-sm border-orange-300 px-2 text-[10px] text-orange-700"
              >
                <XCircle className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-7 w-7 rounded-sm border-red-200 text-red-600"
              aria-label={`Delete ${invoice.invoiceNumber}`}
              title="Delete invoice"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2 text-[10px]">
          <span className="font-medium text-slate-500">{status}</span>
          {invoice.reference && (
            <>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-blue-600">Converted from Proforma</span>
            </>
          )}
          {invoice.status === 'paid' && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Payment recorded
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-7">
        {invoice.status === 'cancelled' && (
          <div className="mb-4 flex items-start gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm">
            <XCircle className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="font-semibold text-slate-950">Invoice Cancelled</p>
              <p className="mt-1 text-slate-600">
                This invoice has been cancelled. Editing and payments are disabled. Click
                &quot;Reinstate&quot; to restore this invoice to draft status.
              </p>
            </div>
          </div>
        )}
        <div className="relative">
          <TaxInvoicePreview invoice={invoice} />
          {invoice.status === 'cancelled' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-45 text-[72px] font-bold tracking-[0.25em] text-red-500/20">
                CANCELLED
              </span>
            </div>
          )}
        </div>
      </div>

      <SendInvoiceEmailDialog
        invoice={invoice}
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        onSent={() => onSendEmail?.(invoice)}
      />
      <RecordPaymentDialog
        invoice={invoice}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onRecord={handlePayment}
      />
      <IssueCreditNoteDialog
        invoice={invoice}
        open={isCreditNoteDialogOpen}
        onOpenChange={setIsCreditNoteDialogOpen}
        onCreate={handleCreditNote}
      />
      <CancelInvoiceDialog
        invoice={invoice}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onCancelInvoice={handleCancelWithOptions}
      />
      <DeleteInvoiceDialog
        invoice={invoice}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteInvoice}
      />
    </div>
  );
}
