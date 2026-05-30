'use client';

import { useState, useEffect } from 'react';
import { DeliveryChallanPanel } from './components/DeliveryChallanPanel';
import { DeliveryChallanForm } from './components/DeliveryChallanForm';
import { DeliveryChallanDetailPanel } from './components/DeliveryChallanDetailPanel';
import { DetailPanel } from './components/DetailPanel';
import { DeliveryChallan } from './types';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import {
  DocumentEmailDialog,
  type DocumentEmailDialogValues,
} from '@/components/email/DocumentEmailDialog';

export default function DeliveryChallanPage() {
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>([]);
  const [selectedDeliveryChallan, setSelectedDeliveryChallan] = useState<DeliveryChallan | null>(
    null,
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState<DocumentEmailDialogValues>({
    recipientEmail: '',
    subject: '',
    message: '',
  });
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

  const handleDownloadPDF = async (deliveryChallan: DeliveryChallan) => {
    try {
      const [{ pdf }, { DeliveryChallanPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/DeliveryChallanPDF'),
      ]);
      const { createElement } = await import('react');
      // Type cast required: pdf() expects DocumentProps element but DeliveryChallanPDF wraps Document internally
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(
        createElement(DeliveryChallanPDF, { challan: deliveryChallan }) as any,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deliveryChallan.challanNumber || 'delivery-challan'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF Downloaded', {
        description: `${deliveryChallan.challanNumber || 'delivery-challan'}.pdf downloaded successfully.`,
      });
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleSendEmail = (deliveryChallan: DeliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setEmailDraft({
      recipientEmail: '',
      subject: `Delivery Challan ${deliveryChallan.challanNumber}`,
      message: `Please find attached the delivery challan ${deliveryChallan.challanNumber}.`,
    });
    setIsEmailDialogOpen(true);
  };

  const handleSubmitEmail = async (values: DocumentEmailDialogValues) => {
    if (!selectedDeliveryChallan) {
      toast.error('No delivery challan selected');
      return;
    }

    setIsSendingEmail(true);
    try {
      const [{ pdf }, { DeliveryChallanPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/DeliveryChallanPDF'),
      ]);
      const { createElement } = await import('react');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(
        createElement(DeliveryChallanPDF, { challan: selectedDeliveryChallan }) as any,
      ).toBlob();

      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await api.post('/delivery-challan-email/send', {
        challanId: selectedDeliveryChallan.id,
        recipientEmail: values.recipientEmail,
        subject: values.subject,
        message: values.message,
        pdfBase64,
      });

      setDeliveryChallans((prev) =>
        prev.map((dc) =>
          dc.id === selectedDeliveryChallan.id ? { ...dc, status: 'sent' as const } : dc,
        ),
      );
      setSelectedDeliveryChallan((prev) => (prev ? { ...prev, status: 'sent' } : null));
      setIsEmailDialogOpen(false);
      toast.success('Delivery challan email sent');
    } catch (error) {
      console.error('Failed to send delivery challan email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send delivery challan email');
    } finally {
      setIsSendingEmail(false);
    }
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
      toast.success('Issued', {
        description: `${deliveryChallan.challanNumber} has been issued.`,
      });
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

      <DocumentEmailDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        title="Email Delivery Challan"
        values={emailDraft}
        submitting={isSendingEmail}
        onSubmit={handleSubmitEmail}
      />
    </div>
  );
}
