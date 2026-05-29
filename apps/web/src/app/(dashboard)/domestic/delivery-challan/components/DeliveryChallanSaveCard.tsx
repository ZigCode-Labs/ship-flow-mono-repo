'use client';

import { DeliveryChallan } from '../types';

interface DeliveryChallanSaveCardProps {
  deliveryChallan: DeliveryChallan;
  isSelected: boolean;
  onSelect: () => void;
}

const statusConfig = {
  delivered: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Issued',
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

const deliveryTypeConfig = {
  supply_of_goods: 'Supply of Goods',
  others: 'Others',
};

function formatDate(dateString: string): string {
  if (!dateString) return '';
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DeliveryChallanSaveCard({
  deliveryChallan,
  isSelected,
  onSelect,
}: DeliveryChallanSaveCardProps) {
  const statusCfg = statusConfig[deliveryChallan.status] || statusConfig.draft;
  const deliveryTypeLabel =
    deliveryTypeConfig[deliveryChallan.deliveryType as keyof typeof deliveryTypeConfig] ||
    'Supply of Goods';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{deliveryChallan.challanNumber}</h3>
          <p className="text-xs text-gray-600 mt-1">{deliveryChallan.customerName}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-700 border border-gray-200">
            {deliveryTypeLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(deliveryChallan.grandTotal)}
          </span>
          <span className="text-xs text-gray-500">{formatDate(deliveryChallan.challanDate)}</span>
        </div>
      </div>
    </div>
  );
}
