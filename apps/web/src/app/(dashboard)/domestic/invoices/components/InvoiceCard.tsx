'use client';

import { Invoice } from '../types';

interface InvoiceCardProps {
  invoice: Invoice;
  isSelected: boolean;
  hasCreditNote?: boolean;
  onClick: () => void;
}

const statusConfig = {
  paid: {
    bg: 'bg-green-50/50',
    text: 'text-green-700',
    border: 'border-green-150/40',
    label: 'Paid',
  },
  unpaid: {
    bg: 'bg-yellow-50/50',
    text: 'text-yellow-700',
    border: 'border-yellow-150/40',
    label: 'Unpaid',
  },
  sent: {
    bg: 'bg-blue-50/50',
    text: 'text-blue-700',
    border: 'border-blue-150/40',
    label: 'Sent',
  },
  overdue: {
    bg: 'bg-red-50/50',
    text: 'text-red-700',
    border: 'border-red-150/40',
    label: 'Overdue',
  },
  draft: {
    bg: 'bg-gray-50/60',
    text: 'text-gray-600',
    border: 'border-gray-200/50',
    label: 'Draft',
  },
  cancelled: {
    bg: 'bg-orange-50/60',
    text: 'text-orange-700',
    border: 'border-orange-200/50',
    label: 'Cancelled',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrencyCard(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function getStatusConfig(status: Invoice['status']) {
  if (status === 'paid') return statusConfig.paid;
  if (status === 'overdue') return statusConfig.overdue;
  if (status === 'sent') return statusConfig.sent;
  if (status === 'draft') return statusConfig.draft;
  if (status === 'cancelled') return statusConfig.cancelled;
  return statusConfig.unpaid;
}

export function InvoiceCard({
  invoice,
  isSelected,
  hasCreditNote = false,
  onClick,
}: InvoiceCardProps) {
  const status = getStatusConfig(invoice.status);

  const isPaid = invoice.status === 'paid';
  const paidAmount = isPaid ? invoice.grandTotal || invoice.amount : 0;
  const dueAmount = isPaid ? 0 : invoice.grandTotal || invoice.amount;

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer rounded-xl border p-4 transition-all duration-200 mb-3 select-none bg-white
        ${
          isSelected
            ? 'border-blue-600 ring-1 ring-blue-500/10 bg-blue-50/5 shadow-sm'
            : 'border-slate-200/80 hover:bg-slate-50/50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
        </div>

        {/* Card Body */}
        <div className="flex-1 space-y-1">
          {/* Customer name and status badge */}
          <div className="flex justify-between items-start">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-[13px] font-bold leading-tight text-slate-800">
                {invoice.customerName || 'No customer'}
              </h3>
              {hasCreditNote && (
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                  CN
                </span>
              )}
            </div>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold select-none leading-none ${status.bg} ${status.text} ${status.border} border`}
            >
              {status.label}
            </span>
          </div>

          {/* Invoice number and Grand Total */}
          <div className="flex justify-between items-center mt-1">
            <span className="text-[12px] text-slate-400 font-medium tracking-tight">
              {invoice.invoiceNumber}
            </span>
            <span className="font-bold text-[13px] text-slate-800">
              {formatCurrencyCard(invoice.grandTotal || invoice.amount)}
            </span>
          </div>

          {/* Divider Progress Bar */}
          <div className="h-1.5 bg-slate-100 rounded-full mt-2.5 mb-1.5" />

          {/* Paid & Due info row */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
            <span>Paid: {formatCurrencyCard(paidAmount)}</span>
            <span>Due: {formatCurrencyCard(dueAmount)}</span>
          </div>

          {/* Date row */}
          <div className="text-[11px] text-slate-400 font-medium pt-1">
            {formatDate(invoice.invoiceDate)}
          </div>
        </div>
      </div>
    </div>
  );
}
