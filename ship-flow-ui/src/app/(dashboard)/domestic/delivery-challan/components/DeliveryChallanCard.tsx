'use client';

import { FileText } from 'lucide-react';
import { DeliveryChallan } from '../types';

interface DeliveryChallanCardProps {
  deliveryChallan: DeliveryChallan;
  isSelected: boolean;
  onSelect: () => void;
}

const statusConfig = {
  delivered: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Delivered',
  },
  sent: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Sent',
  },
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    label: 'Draft',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Cancelled',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
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

export function DeliveryChallanCard({
  deliveryChallan,
  isSelected,
  onSelect,
}: DeliveryChallanCardProps) {
  const config = statusConfig[deliveryChallan.status] || statusConfig.draft;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">{deliveryChallan.challanNumber}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
        >
          {config.label}
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-900">{deliveryChallan.customerName}</p>
          <p className="text-xs text-gray-500">
            Challan Date: {formatDate(deliveryChallan.challanDate)}
          </p>
          {deliveryChallan.deliveryDate && (
            <p className="text-xs text-gray-500">
              Delivery Date: {formatDate(deliveryChallan.deliveryDate)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(deliveryChallan.grandTotal)}
          </span>
          <span className="text-xs text-gray-500">
            {deliveryChallan.lineItems.length} item
            {deliveryChallan.lineItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
