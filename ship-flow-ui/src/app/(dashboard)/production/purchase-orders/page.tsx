'use client';

import { useMemo, useState } from 'react';
import { Download, Edit, Plus, Printer, Search, Send, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { PurchaseOrderForm } from './components/PurchaseOrderForm';
import poFormConfig from './data/po-form-config.json';
import type { PurchaseOrder } from './types';
import type { PurchaseOrderFormConfig, PurchaseOrderFormValues } from './types/form';

const typedFormConfig = poFormConfig as PurchaseOrderFormConfig;

const formatCurrency = (currency: string, amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const formatDisplayDate = (date: string): string => {
  if (!date) return '-';
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const getNextPONumber = (orders: PurchaseOrder[]): string => {
  const nextNumber =
    orders.reduce((max, order) => {
      const number = Number(order.poNumber.replace(/\D/g, ''));
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0) + 1;

  return `PO-2026-${String(nextNumber).padStart(5, '0')}`;
};

const getSupplierLabel = (value: string): string =>
  typedFormConfig.dataSources.suppliers.find((supplier) => supplier.value === value)?.label ??
  'No supplier';

function PurchaseOrderDetail({
  purchaseOrder,
  onSend,
  onDelete,
}: {
  purchaseOrder: PurchaseOrder;
  onSend: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      <div className="flex h-[66px] items-center justify-between border-b border-gray-200 bg-white px-5">
        <h2 className="text-base font-semibold text-black">{purchaseOrder.poNumber}</h2>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              purchaseOrder.status === 'sent'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {purchaseOrder.status === 'sent' ? 'Sent' : 'Draft'}
          </span>
          <div className="h-7 w-px bg-gray-200" />
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-[6px] border-gray-200 px-4 text-sm font-semibold text-black"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={onSend}
            disabled={purchaseOrder.status === 'sent'}
            className="h-10 gap-2 rounded-[6px] border-gray-200 px-4 text-sm font-semibold text-emerald-700"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            className="h-10 gap-2 rounded-[6px] border-gray-200 px-4 text-sm font-semibold text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="h-7 w-px bg-gray-200" />
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-10 gap-2 rounded-[6px] border-gray-200 px-4 text-sm font-semibold text-black"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('PDF export is ready for backend integration')}
            className="h-10 gap-2 rounded-[6px] border-gray-200 px-4 text-sm font-semibold text-black"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-12 py-6">
        <div className="mx-auto w-full max-w-[980px] border border-gray-300 bg-white text-black">
          <div className="flex items-center justify-between border-b border-gray-300 px-7 py-5">
            <div className="flex items-center gap-5">
              <div className="flex h-[72px] w-36 items-center justify-center rounded-[4px] border border-gray-200 bg-gray-100 text-xs text-gray-400">
                No Logo
              </div>
              <div className="text-lg font-bold">Global Loom Textiles Pvt Ltd</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-gray-600">GSTIN</div>
              <div className="font-bold">27AAAAA0000A1Z5</div>
            </div>
          </div>

          <div className="border-b border-gray-300 bg-gray-50 py-4 text-center text-2xl font-bold">
            PURCHASE ORDER
          </div>

          <div className="px-7 py-7">
            <div className="mb-8 flex items-start justify-between border-b border-emerald-300 pb-8">
              <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-bold">
                {purchaseOrder.status.toUpperCase()}
              </span>
              <div className="text-right text-sm">
                <div>
                  <span className="text-gray-600">PO #: </span>
                  <span className="font-bold">{purchaseOrder.poNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date: </span>
                  <span>{formatDisplayDate(purchaseOrder.orderDate)}</span>
                </div>
              </div>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-7">
              <div className="rounded-[4px] border border-gray-200 p-5">
                <h3 className="border-b border-gray-100 pb-2 text-sm font-bold text-emerald-600">
                  SUPPLIER
                </h3>
                <p className="pt-4 text-lg font-bold">{purchaseOrder.supplierName}</p>
              </div>
              <div className="rounded-[4px] border border-gray-200 p-5">
                <h3 className="border-b border-gray-100 pb-2 text-sm font-bold text-emerald-600">
                  ORDER DETAILS
                </h3>
                <p className="pt-4 text-base text-gray-600">
                  Delivery: {formatDisplayDate(purchaseOrder.deliveryDate)}
                </p>
              </div>
            </div>

            <section className="mb-7">
              <h3 className="mb-3 text-sm font-bold tracking-wide text-emerald-600">ITEMS</h3>
              <div className="overflow-hidden rounded-[4px] border border-gray-200">
                <div className="grid grid-cols-[1fr_1.8fr_0.8fr_0.8fr_1fr_1.1fr] bg-gray-50 text-xs font-bold text-gray-700">
                  <div className="px-4 py-3">Item Code</div>
                  <div className="px-4 py-3">Description</div>
                  <div className="px-4 py-3 text-right">Qty</div>
                  <div className="px-4 py-3 text-center">Unit</div>
                  <div className="px-4 py-3 text-right">Rate</div>
                  <div className="px-4 py-3 text-right">Amount</div>
                </div>
                {purchaseOrder.items.length > 0 ? (
                  purchaseOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_1.8fr_0.8fr_0.8fr_1fr_1.1fr] border-t border-gray-200 text-sm"
                    >
                      <div className="px-4 py-3">{item.itemCode || '-'}</div>
                      <div className="px-4 py-3">{item.itemName || '-'}</div>
                      <div className="px-4 py-3 text-right">{item.quantity.toFixed(3)}</div>
                      <div className="px-4 py-3 text-center">{item.unit || 'PCS'}</div>
                      <div className="px-4 py-3 text-right">
                        {formatCurrency(purchaseOrder.currency, item.unitPrice)}
                      </div>
                      <div className="px-4 py-3 text-right font-bold">
                        {formatCurrency(purchaseOrder.currency, item.total)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
                    No line items
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold tracking-wide text-emerald-600">SUMMARY</h3>
              <div className="ml-auto w-[360px] space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(purchaseOrder.currency, purchaseOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-emerald-600">
                    {formatCurrency(purchaseOrder.currency, purchaseOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const filteredPOs = useMemo(() => {
    if (!searchQuery.trim()) return purchaseOrders;
    const query = searchQuery.toLowerCase();
    return purchaseOrders.filter(
      (po) =>
        po.poNumber.toLowerCase().includes(query) || po.supplierName.toLowerCase().includes(query),
    );
  }, [purchaseOrders, searchQuery]);

  const nextPONumber = useMemo(() => getNextPONumber(purchaseOrders), [purchaseOrders]);

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedPO(null);
  };

  const handleCancelCreate = () => {
    setIsCreatingNew(false);
  };

  const handleSave = (data: PurchaseOrderFormValues) => {
    const savedPO: PurchaseOrder = {
      id: `purchase_order_${Date.now()}`,
      poNumber: data.poNumber,
      supplierName: getSupplierLabel(data.supplier),
      orderDate: data.issueDate,
      deliveryDate: data.expectedDeliveryDate,
      status: 'draft',
      totalAmount:
        data.lineItems.reduce((sum, item) => sum + item.total, 0) + data.additionalCharges,
      currency: data.currency,
      items: data.lineItems.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        quantity: item.quantity,
        unitPrice: item.rate,
        unit: item.unit,
        total: item.total,
      })),
      notes: data.notes,
    };

    setPurchaseOrders((prev) => [savedPO, ...prev]);
    setSelectedPO(savedPO);
    setIsCreatingNew(false);
  };

  const handleSend = (purchaseOrder: PurchaseOrder) => {
    const sentPO: PurchaseOrder = { ...purchaseOrder, status: 'sent' };
    setPurchaseOrders((prev) => prev.map((po) => (po.id === purchaseOrder.id ? sentPO : po)));
    setSelectedPO(sentPO);
    toast('Success', {
      description: 'Purchase order sent',
      position: 'top-right',
    });
  };

  const handleDelete = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== purchaseOrder.id));
    setSelectedPO(null);
    toast('Success', {
      description: 'Purchase order deleted',
      position: 'top-right',
    });
  };

  const hasPurchaseOrders = purchaseOrders.length > 0;

  return (
    <div className="flex h-full">
      <div className="flex w-[360px] flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-emerald-600" />
            <h1 className="text-base font-semibold text-gray-900">Purchase Orders</h1>
          </div>
          <Button
            onClick={handleCreateNew}
            className="h-7 gap-1 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="size-3.5" />
            New
          </Button>
        </div>

        <div className="border-b border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-sm border-gray-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!hasPurchaseOrders ? (
            <div className="flex h-full flex-col items-center justify-center px-6">
              <ShoppingCart className="size-10 text-gray-300" />
              <p className="mt-4 text-center text-sm font-medium text-gray-600">
                No purchase orders yet
              </p>
              <p className="mt-1 text-center text-xs text-gray-400">
                Create your first purchase order
              </p>
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12">
              <p className="text-center text-sm text-muted-foreground">
                No purchase orders found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {purchaseOrders.length} {purchaseOrders.length === 1 ? 'order' : 'orders'}
              </p>
              {filteredPOs.map((po) => (
                <button
                  key={po.id}
                  onClick={() => setSelectedPO(po)}
                  className={`w-full rounded-[8px] border px-3 py-3 text-left transition-colors ${
                    selectedPO?.id === po.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-black">{po.supplierName}</p>
                      <p className="mt-2 text-sm text-slate-600">{po.poNumber}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDisplayDate(po.orderDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </span>
                      <p className="mt-3 text-sm font-bold text-black">
                        {formatCurrency(po.currency, po.totalAmount)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {isCreatingNew ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-6 pb-20">
              <PurchaseOrderForm
                initialData={{ poNumber: nextPONumber }}
                onSave={handleSave}
                onCancel={handleCancelCreate}
              />
            </div>
          </div>
        ) : selectedPO ? (
          <PurchaseOrderDetail
            purchaseOrder={selectedPO}
            onSend={() => handleSend(selectedPO)}
            onDelete={() => handleDelete(selectedPO)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6">
            <ShoppingCart className="size-12 text-gray-300" />
            <p className="mt-4 text-center text-sm font-medium text-gray-500">
              Select a PO to view details
            </p>
            <p className="text-center text-xs text-gray-400">or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
