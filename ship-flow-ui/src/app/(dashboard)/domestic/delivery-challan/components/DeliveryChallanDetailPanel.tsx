'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, FileText, Download, Mail, X, RotateCcw } from 'lucide-react';
import { DeliveryChallan } from '../types';

interface DeliveryChallanDetailPanelProps {
  deliveryChallan: DeliveryChallan | null;
  onDownloadPDF: (deliveryChallan: DeliveryChallan) => void;
  onSendEmail: (deliveryChallan: DeliveryChallan) => void;
  onMarkAsDelivered: (deliveryChallan: DeliveryChallan) => void;
  onEdit: (deliveryChallan: DeliveryChallan) => void;
  onCancel: (deliveryChallan: DeliveryChallan) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function amountInWords(value: number): string {
  if (value === 0) return 'Zero Rupees Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const convertLessThanOneThousand = (num: number): string => {
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    return (
      ones[Math.floor(num / 100)] +
      ' Hundred' +
      (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '')
    );
  };

  const integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);

  let result = '';

  if (integerPart >= 10000000) {
    result += convertLessThanOneThousand(Math.floor(integerPart / 10000000)) + ' Crore ';
  }
  if (integerPart >= 100000) {
    result += convertLessThanOneThousand(Math.floor((integerPart % 10000000) / 100000)) + ' Lakh ';
  }
  if (integerPart >= 1000) {
    result += convertLessThanOneThousand(Math.floor((integerPart % 100000) / 1000)) + ' Thousand ';
  }
  if (integerPart > 0) {
    result += convertLessThanOneThousand(integerPart % 1000);
  }

  result = result.trim() + ' Rupees';

  if (decimalPart > 0) {
    result += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
  }

  return result + ' Only';
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-slate-400">
      <FileText className="mb-4 h-16 w-16 text-slate-300" />
      <h3 className="mb-2 text-lg font-medium">No Delivery Challan Selected</h3>
      <p className="text-sm">Select a delivery challan from the list or create a new one</p>
    </div>
  );
}

export function DeliveryChallanDetailPanel({
  deliveryChallan,
  onDownloadPDF,
  onSendEmail,
  onMarkAsDelivered,
  onEdit,
  onCancel,
}: DeliveryChallanDetailPanelProps) {
  if (!deliveryChallan) {
    return <EmptyState />;
  }

  const totalQty = deliveryChallan.lineItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const statusLabel =
    deliveryChallan.status === 'draft'
      ? 'Draft'
      : deliveryChallan.status === 'delivered'
        ? 'Delivered'
        : deliveryChallan.status === 'sent'
          ? 'Sent'
          : 'Cancelled';

  const deliveryTypeLabel =
    deliveryChallan.deliveryType === 'supply_of_goods'
      ? 'Supply of Goods'
      : deliveryChallan.deliveryType || 'Others';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onEdit(deliveryChallan)}
          className="h-7 gap-1 rounded-sm border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50"
        >
          <Edit className="h-3 w-3" />
          Edit
        </Button>
        <Button
          size="xs"
          onClick={() => onMarkAsDelivered(deliveryChallan)}
          className="h-7 gap-1 rounded-sm bg-blue-600 text-[11px] text-white hover:bg-blue-700"
          disabled={deliveryChallan.status === 'delivered'}
        >
          <RotateCcw className="h-3 w-3" />
          Issue
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onDownloadPDF(deliveryChallan)}
          className="h-7 gap-1 rounded-sm border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-3 w-3" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onSendEmail(deliveryChallan)}
          className="h-7 gap-1 rounded-sm border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50"
        >
          <Mail className="h-3 w-3" />
          Email
        </Button>
        <Button
          variant="destructive"
          size="xs"
          onClick={() => onCancel(deliveryChallan)}
          className="h-7 gap-1 rounded-sm border-red-200 bg-red-50 text-[11px] text-red-600 hover:bg-red-100"
        >
          <X className="h-3 w-3" />
          Cancel
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-950">
              {deliveryChallan.challanNumber}
            </h1>
            <p className="text-[11px] text-slate-500">{formatDate(deliveryChallan.challanDate)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-5 rounded-full border-slate-200 bg-slate-50 px-2 text-[10px] font-medium text-slate-600"
            >
              {statusLabel}
            </Badge>
            <Badge
              variant="outline"
              className="h-5 rounded-full border-slate-200 bg-slate-50 px-2 text-[10px] font-medium text-slate-600"
            >
              {deliveryTypeLabel}
            </Badge>
          </div>
        </div>

        {/* From / Deliver To Cards */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">From</p>
            <p className="text-[11px] font-medium text-slate-950">{deliveryChallan.companyName}</p>
            <p className="text-[10px] text-slate-500">
              {deliveryChallan.buyerAddress || deliveryChallan.state}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Deliver To</p>
            <p className="text-[11px] font-medium text-slate-950">{deliveryChallan.customerName}</p>
            <p className="text-[10px] text-slate-500">{deliveryChallan.placeOfSupply}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-2 py-1.5 text-left font-semibold text-slate-600">#</th>
                <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Description</th>
                <th className="px-2 py-1.5 text-right font-semibold text-slate-600">Item Code</th>
                <th className="px-2 py-1.5 text-right font-semibold text-slate-600">HSN</th>
                <th className="px-2 py-1.5 text-right font-semibold text-slate-600">Qty</th>
                <th className="px-2 py-1.5 text-right font-semibold text-slate-600">Unit</th>
                <th className="px-2 py-1.5 text-right font-semibold text-slate-600">Rate</th>
                <th className="px-2 py-1.5 text-right font-semibold text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deliveryChallan.lineItems.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-2 py-1.5 text-slate-600">{index + 1}</td>
                  <td className="px-2 py-1.5 font-medium text-slate-950">{item.description}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{item.itemCode}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{item.hsn}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">
                    {item.quantity.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{item.unit}</td>
                  <td className="px-2 py-1.5 text-right text-slate-950">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-slate-950">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="ml-auto w-full max-w-[280px] space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Qty:</span>
            <span className="font-semibold text-slate-950">{totalQty.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="font-semibold text-slate-950">Grand Total:</span>
            <span className="font-semibold text-slate-950">
              {formatCurrency(deliveryChallan.grandTotal)}
            </span>
          </div>
          <p className="text-right text-[9px] italic leading-tight text-slate-500">
            {amountInWords(deliveryChallan.grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
