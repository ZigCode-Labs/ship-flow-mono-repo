'use client';

import { useState } from 'react';
import { Edit, Mail, FileText, RefreshCw, Trash2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import { ConvertConfirmationDialog } from './ConvertConfirmationDialog';
import { SendProformaEmailDialog } from './SendProformaEmailDialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InvoicePaper,
  InvoiceHeader,
  InvoiceTitle,
  InvoiceBilling,
  InvoiceTable,
  InvoiceSummary,
  InvoiceFooter,
} from '@/components/ui/invoice';

interface ProformaInvoiceViewerProps {
  proforma: any;
  onEdit: (proforma: any) => void;
  onBack: () => void;
  onDeleteSuccess: () => void;
  onStatusUpdate: () => void;
}

const PLACE_OF_SUPPLY_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

export function ProformaInvoiceViewer({
  proforma,
  onEdit,
  onBack,
  onDeleteSuccess,
  onStatusUpdate,
}: ProformaInvoiceViewerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(proforma?.status || 'DRAFT');
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!proforma) return null;

  const customerStateName =
    PLACE_OF_SUPPLY_MAP[proforma.placeOfSupply] || proforma.placeOfSupply || 'N/A';
  const sellerStateName = proforma.sellerState || 'Maharashtra';

  // Determine tax breakdown:
  // If Seller State matches Customer State (e.g. Maharashtra == Maharashtra),
  // apply CGST and SGST (each is 50% of the total tax). Otherwise, apply IGST.
  const isIntrastate =
    sellerStateName.toLowerCase().trim() === customerStateName.toLowerCase().trim();

  const cgst = isIntrastate ? proforma.totalTax / 2 : undefined;
  const sgst = isIntrastate ? proforma.totalTax / 2 : undefined;
  const igst = !isIntrastate ? proforma.totalTax : undefined;

  // Handle delete
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/domestic-proformas/${proforma.id}`);
      toast.success('Deleted Successfully', {
        description: `Proforma ${proforma.proformaNumber} has been deleted.`,
      });
      onDeleteSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Error', {
        description: 'An error occurred while deleting.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Mark as Sent
  const handleMarkAsSent = async () => {
    setIsUpdatingStatus(true);
    try {
      await api.put(`/domestic-proformas/${proforma.id}`, { status: 'SENT' });
      setCurrentStatus('SENT');
      toast.success('Status Updated', {
        description: 'Proforma marked as Sent.',
      });
      onStatusUpdate();
    } catch (err) {
      console.error(err);
      toast.error('Error', {
        description: 'An error occurred while updating status.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Email
  const handleEmail = () => {
    setShowEmailDialog(true);
  };

  // Handle PDF download
  const handlePrint = async () => {
    setIsDownloadingPDF(true);
    try {
      const [{ pdf }, { ProformaInvoicePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/ProformaInvoicePDF'),
      ]);
      const { createElement } = await import('react');
      const blob = await pdf(createElement(ProformaInvoicePDF, { proforma })).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proforma.proformaNumber || 'proforma'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF Downloaded', {
        description: `${proforma.proformaNumber || 'proforma'}.pdf downloaded successfully.`,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Handle Convert to Invoice
  const handleConvert = () => {
    setShowConvertDialog(true);
  };

  const handleConfirmConvert = async () => {
    try {
      const payload = {
        invoiceNumber: `TX-${proforma.proformaNumber.replace('DPI-', '').replace('AKA-', '') || Date.now().toString().slice(-6)}`,
        customerName: proforma.customerName || 'Unknown Customer',
        invoiceDate: new Date().toISOString(),
        dueDate:
          proforma.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: proforma.grandTotal || 0,
        status: 'draft',
        companyName: proforma.sellerCompanyName || 'global tech company',
        gstin: proforma.sellerGstin || 'N/A',
        state: proforma.sellerState || 'Maharashtra',
        customerId: proforma.customerId || 'URP',
        customerGstin: proforma.customerGstin || 'URP',
        placeOfSupply: proforma.placeOfSupply || '27',
        bankName: 'N/A',
        accountNumber: 'N/A',
        ifscCode: 'N/A',
        branch: 'N/A',
        paymentTerms: proforma.paymentTerms || 'Net 30 days',
        reference: proforma.proformaNumber || '',
        notes: proforma.notes || '',
        exchangeRate: proforma.exchangeRate || 1,
        lineItems: (proforma.lineItems || []).map((item: any) => ({
          id: item.id || `ITEM-${Math.random()}`,
          itemCode: item.itemCode || 'MISC',
          description: item.description || 'Miscellaneous Item',
          hsn: item.hsn || '999999',
          quantity: item.qty || 1,
          rate: item.rate || 0,
          amount: item.amount || 0,
          gst: item.gstPercent || 0,
          total: item.total || 0,
        })),
        subtotal: proforma.subtotal || 0,
        discount: proforma.discountAmount || 0,
        taxableAmount: proforma.taxableAmount || 0,
        totalTax: proforma.totalTax || 0,
        grandTotal: proforma.grandTotal || 0,
      };

      await api.post('/tax-invoices', payload);

      toast.success('Success', {
        description: 'Proforma converted to Tax Invoice successfully',
        duration: 4000,
      });
    } catch (err) {
      console.error(err);
      toast.error('Error', {
        description: 'Failed to convert proforma to Tax Invoice.',
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden print:bg-white select-none">
      {/* Top action bar */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 tracking-tight">
                {proforma.proformaNumber}
              </h1>
              <Badge
                variant="outline"
                className={
                  currentStatus === 'SENT'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full'
                    : 'border-slate-200 bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full'
                }
              >
                {currentStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {proforma.customerName || 'No customer'}
            </p>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(proforma)}
            className="h-8.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </Button>

          {currentStatus !== 'SENT' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={handleMarkAsSent}
              className="h-8.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              Mark as Sent
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleEmail}
            className="h-8.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5 text-blue-500" />
            Email
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isDownloadingPDF}
            className="h-8.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-orange-500" />
            {isDownloadingPDF ? 'Generating...' : 'PDF'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleConvert}
            className="h-8.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
            Convert
          </Button>

          <Button
            variant="outline"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            className="h-8.5 w-8.5 border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm cursor-pointer"
            title="Delete Proforma"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* A4 Invoice Paper Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0 print:overflow-visible">
        <InvoicePaper className="print:shadow-none animate-in fade-in zoom-in-95 duration-200">
          <InvoiceHeader
            sellerName={proforma.sellerCompanyName}
            sellerGstin={proforma.sellerGstin}
          />
          <InvoiceTitle>Proforma Invoice</InvoiceTitle>
          <InvoiceBilling
            customerName={proforma.customerName}
            customerGstin={proforma.customerGstin}
            customerAddress={customerStateName}
            proformaNumber={proforma.proformaNumber}
            date={proforma.date}
            validUntil={proforma.validUntil}
          />
          <InvoiceTable items={proforma.lineItems} />
          <InvoiceSummary
            subtotal={proforma.subtotal}
            discountAmount={proforma.discountAmount}
            taxableAmount={proforma.taxableAmount}
            cgst={cgst}
            sgst={sgst}
            igst={igst}
            totalTax={proforma.totalTax}
            grandTotal={proforma.grandTotal}
          />
          <InvoiceFooter
            grandTotal={proforma.grandTotal}
            sellerCompanyName={proforma.sellerCompanyName}
            terms={proforma.notes}
            bankDetails={{
              bankName: 'N/A',
              accountNo: 'N/A',
              ifscCode: 'N/A',
            }}
          />
        </InvoicePaper>
      </div>

      <ConvertConfirmationDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        onConfirm={handleConfirmConvert}
      />

      <SendProformaEmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        proforma={proforma}
        onSent={() => {
          setCurrentStatus('SENT');
          onStatusUpdate();
        }}
      />
    </div>
  );
}
