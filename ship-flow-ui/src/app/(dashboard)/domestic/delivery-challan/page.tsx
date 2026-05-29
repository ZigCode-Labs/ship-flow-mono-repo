'use client';

import { useState, useEffect } from 'react';
import { DeliveryChallanPanel } from './components/DeliveryChallanPanel';
import { DeliveryChallanForm } from './components/DeliveryChallanForm';
import { DeliveryChallanDetailPanel } from './components/DeliveryChallanDetailPanel';
import { DetailPanel } from './components/DetailPanel';
import { DeliveryChallan } from './types';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';

export default function DeliveryChallanPage() {
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>([]);
  const [selectedDeliveryChallan, setSelectedDeliveryChallan] = useState<DeliveryChallan | null>(
    null,
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryChallans();
  }, []);

  const fetchDeliveryChallans = async () => {
    try {
      setLoading(true);
      const data = await api.get<DeliveryChallan[]>('/delivery-challans');
      setDeliveryChallans(data);
    } catch (error) {
      console.error('Failed to fetch delivery challans:', error);
      toast.error('Failed to load delivery challans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeliveryChallan = (deliveryChallan: DeliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setIsCreatingNew(false);
    setIsEditing(false);
  };

  const handleNewDeliveryChallan = () => {
    setSelectedDeliveryChallan(null);
    setIsCreatingNew(true);
    setIsEditing(false);
  };

  const handleSaveDeliveryChallan = async (deliveryChallanData: DeliveryChallan) => {
    try {
      if (isCreatingNew) {
        const payload = {
          challanNumber: deliveryChallanData.challanNumber,
          challanDate: new Date(deliveryChallanData.challanDate),
          deliveryDate: deliveryChallanData.deliveryDate
            ? new Date(deliveryChallanData.deliveryDate)
            : null,
          deliveryType: deliveryChallanData.deliveryType || 'supply_of_goods',
          companyName: deliveryChallanData.companyName,
          gstin: deliveryChallanData.gstin || '',
          state: deliveryChallanData.state || '',
          customerId: deliveryChallanData.customerId || '',
          customerName: deliveryChallanData.customerName,
          customerGstin: deliveryChallanData.customerGstin || '',
          buyerAddress: deliveryChallanData.buyerAddress || '',
          buyerState: deliveryChallanData.placeOfSupply || '',
          placeOfSupply: deliveryChallanData.placeOfSupply,
          transporterName: null,
          vehicleNumber: null,
          expectedDeliveryDate: null,
          linkedInvoiceId: deliveryChallanData.reference || null,
          reference: deliveryChallanData.reference || null,
          notes: deliveryChallanData.notes || null,
          exchangeRate: deliveryChallanData.exchangeRate || 1,
          subtotal: deliveryChallanData.subtotal,
          discount: deliveryChallanData.discount || 0,
          taxableAmount: deliveryChallanData.taxableAmount,
          totalTax: deliveryChallanData.totalTax || 0,
          grandTotal: deliveryChallanData.grandTotal,
          status: 'draft',
          lineItems: deliveryChallanData.lineItems.map((item) => ({
            itemCode: item.itemCode || '',
            description: item.description,
            hsn: item.hsn || '',
            quantity: item.quantity,
            unit: item.unit || 'PCS',
            rate: item.rate,
            amount: item.amount,
            gst: item.gst || 0,
            total: item.total,
          })),
        };

        const savedData = await api.post<DeliveryChallan>('/delivery-challans', payload);
        setDeliveryChallans((prev) => [...prev, savedData]);
        setSelectedDeliveryChallan(savedData);
        toast.success('Delivery challan created');
      } else {
        const payload = {
          challanNumber: deliveryChallanData.challanNumber,
          challanDate: new Date(deliveryChallanData.challanDate),
          deliveryDate: deliveryChallanData.deliveryDate
            ? new Date(deliveryChallanData.deliveryDate)
            : null,
          companyName: deliveryChallanData.companyName,
          customerName: deliveryChallanData.customerName,
          customerGstin: deliveryChallanData.customerGstin || '',
          placeOfSupply: deliveryChallanData.placeOfSupply,
          notes: deliveryChallanData.notes || null,
          lineItems: deliveryChallanData.lineItems.map((item) => ({
            itemCode: item.itemCode || '',
            description: item.description,
            hsn: item.hsn || '',
            quantity: item.quantity,
            unit: item.unit || 'PCS',
            rate: item.rate,
            amount: item.amount,
            gst: item.gst || 0,
            total: item.total,
          })),
        };

        const savedData = await api.put<DeliveryChallan>(
          `/delivery-challans/${deliveryChallanData.id}`,
          payload,
        );
        setDeliveryChallans((prev) =>
          prev.map((dc) => (dc.id === deliveryChallanData.id ? savedData : dc)),
        );
        setSelectedDeliveryChallan(savedData);
        toast.success('Delivery challan updated');
      }
      setIsCreatingNew(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save delivery challan:', error);
      toast.error('Failed to save delivery challan');
    }
  };

  const handleCancelForm = () => {
    setIsCreatingNew(false);
    setIsEditing(false);
  };

  const handleDownloadPDF = (deliveryChallan: DeliveryChallan) => {
    toast.success(`Downloaded ${deliveryChallan.challanNumber}.pdf`);
  };

  const handleSendEmail = (deliveryChallan: DeliveryChallan) => {
    toast.success(`Email sent to customer for ${deliveryChallan.challanNumber}`);
  };

  const handleMarkAsDelivered = async (deliveryChallan: DeliveryChallan) => {
    try {
      await api.put<DeliveryChallan>(`/delivery-challans/${deliveryChallan.id}`, {
        status: 'delivered',
      });
      setDeliveryChallans((prev) =>
        prev.map((dc) =>
          dc.id === deliveryChallan.id ? { ...dc, status: 'delivered' as const } : dc,
        ),
      );
      if (selectedDeliveryChallan?.id === deliveryChallan.id) {
        setSelectedDeliveryChallan((prev) => (prev ? { ...prev, status: 'delivered' } : null));
      }
      toast.success(`Marked ${deliveryChallan.challanNumber} as delivered`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (deliveryChallan: DeliveryChallan) => {
    try {
      await api.put<DeliveryChallan>(`/delivery-challans/${deliveryChallan.id}`, {
        status: 'cancelled',
      });
      setDeliveryChallans((prev) =>
        prev.map((dc) =>
          dc.id === deliveryChallan.id ? { ...dc, status: 'cancelled' as const } : dc,
        ),
      );
      if (selectedDeliveryChallan?.id === deliveryChallan.id) {
        setSelectedDeliveryChallan((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      }
      toast.success(`Cancelled ${deliveryChallan.challanNumber}`);
    } catch (error) {
      console.error('Failed to cancel:', error);
      toast.error('Failed to cancel delivery challan');
    }
  };

  const handleEdit = (deliveryChallan: DeliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-slate-600">Loading delivery challans...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-row">
      <DeliveryChallanPanel
        deliveryChallans={deliveryChallans}
        selectedDeliveryChallan={selectedDeliveryChallan}
        onSelect={handleSelectDeliveryChallan}
        onNew={handleNewDeliveryChallan}
      />

      {isCreatingNew || isEditing ? (
        <div className="flex-1 overflow-hidden">
          <DeliveryChallanForm
            deliveryChallan={selectedDeliveryChallan || undefined}
            isNew={isCreatingNew}
            onSave={handleSaveDeliveryChallan}
            onCancel={handleCancelForm}
          />
        </div>
      ) : selectedDeliveryChallan ? (
        <div className="flex-1 overflow-hidden">
          <DeliveryChallanDetailPanel
            deliveryChallan={selectedDeliveryChallan}
            onDownloadPDF={handleDownloadPDF}
            onSendEmail={handleSendEmail}
            onMarkAsDelivered={handleMarkAsDelivered}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DetailPanel />
        </div>
      )}
    </div>
  );
}
