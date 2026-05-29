'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

import { RMPurchaseOrderForm } from './RMPurchaseOrderForm';
import type { RMPurchaseOrder, RMPurchaseOrderFormValues } from './types';

const formatAmount = (currency: string, amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string): string => {
  if (!date) return '-';

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const getNextPONumber = (orders: RMPurchaseOrder[]): string => {
  const nextNumber =
    orders.reduce((highest, order) => {
      const numericPart = Number(order.poNumber.replace(/\D/g, ''));

      return Number.isNaN(numericPart) ? highest : Math.max(highest, numericPart);
    }, 0) + 1;

  return `RMPO-${String(nextNumber).padStart(3, '0')}`;
};

const getSupplierName = (values: RMPurchaseOrderFormValues): string =>
  values.supplier
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Unassigned supplier';

function RMPurchaseOrdersList({
  orders,
  selectedOrderId,
  searchQuery,
  onSearchQueryChange,
  onCreateNew,
  onSelectOrder,
}: {
  orders: RMPurchaseOrder[];
  selectedOrderId?: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onCreateNew: () => void;
  onSelectOrder: (order: RMPurchaseOrder) => void;
}) {
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter(
      (order) =>
        order.poNumber.toLowerCase().includes(query) ||
        order.supplierName.toLowerCase().includes(query),
    );
  }, [orders, searchQuery]);

  return (
    <aside className="flex w-[322px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-emerald-600" />
          <h1 className="text-lg font-semibold text-slate-950">Purchase Orders</h1>
        </div>
        <Button
          type="button"
          onClick={onCreateNew}
          className="h-9 gap-2 rounded-[5px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <div className="border-b border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search purchase orders..."
            className="h-10 rounded-[5px] border-slate-300 bg-white pl-9 text-sm shadow-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex h-full flex-col items-center pt-7 text-center">
            <ShoppingCart className="size-12 text-slate-300" strokeWidth={1.8} />
            <p className="mt-4 text-base font-medium text-slate-600">No purchase orders yet</p>
            <p className="mt-1 text-sm text-slate-400">Create your first purchase order</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
            No purchase orders found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder(order)}
                className={`w-full rounded-[5px] border px-3 py-3 text-left transition-colors ${
                  selectedOrderId === order.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {order.supplierName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{order.poNumber}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(order.issueDate)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                      Draft
                    </span>
                    <p className="mt-2 text-xs font-semibold text-slate-950">
                      {formatAmount(order.currency, order.totalAmount)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function EmptyDetailsPanel() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center text-center">
        <ShoppingCart className="size-12 text-slate-400" strokeWidth={1.8} />
        <p className="mt-4 text-base font-medium text-slate-500">Select a PO to view details</p>
        <p className="text-sm text-slate-400">or create a new one</p>
      </div>
    </div>
  );
}

function RMPurchaseOrderDetails({ order }: { order: RMPurchaseOrder }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-950">{order.poNumber}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Draft</span>
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[5px] border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <p className="font-semibold text-slate-950">{order.supplierName}</p>
          <p className="mt-2 text-slate-500">{formatDate(order.issueDate)}</p>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Grand Total</span>
              <span className="font-semibold text-emerald-600">
                {formatAmount(order.currency, order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RMPurchaseOrdersWorkspace() {
  const [orders, setOrders] = useState<RMPurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<RMPurchaseOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const nextPONumber = useMemo(() => getNextPONumber(orders), [orders]);

  const handleCreateNew = (): void => {
    setSelectedOrder(null);
    setIsCreating(true);
  };

  const handleSelectOrder = (order: RMPurchaseOrder): void => {
    setSelectedOrder(order);
    setIsCreating(false);
  };

  const handleSave = (values: RMPurchaseOrderFormValues): void => {
    const totalAmount =
      values.lineItems.reduce((sum, item) => sum + item.total, 0) + values.additionalCharges;
    const newOrder: RMPurchaseOrder = {
      id: `rm_po_${Date.now()}`,
      poNumber: values.poNumber,
      supplierName: getSupplierName(values),
      issueDate: values.issueDate,
      totalAmount,
      currency: values.currency,
      status: 'draft',
      lineItems: values.lineItems,
    };

    setOrders((current) => [newOrder, ...current]);
    setSelectedOrder(newOrder);
    setIsCreating(false);
    toast.success('Raw material purchase order saved');
  };

  return (
    <div className="flex h-full min-h-0 bg-slate-50">
      <RMPurchaseOrdersList
        orders={orders}
        selectedOrderId={selectedOrder?.id}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onCreateNew={handleCreateNew}
        onSelectOrder={handleSelectOrder}
      />
      {isCreating ? (
        <RMPurchaseOrderForm
          poNumber={nextPONumber}
          onBack={() => setIsCreating(false)}
          onSave={handleSave}
        />
      ) : selectedOrder ? (
        <RMPurchaseOrderDetails order={selectedOrder} />
      ) : (
        <EmptyDetailsPanel />
      )}
    </div>
  );
}
