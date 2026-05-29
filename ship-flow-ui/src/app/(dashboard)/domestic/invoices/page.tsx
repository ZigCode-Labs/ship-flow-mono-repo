'use client';

import { useState, useEffect } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceDetailPanel } from './components/InvoiceDetailPanel';
import { InvoiceList } from './components/InvoiceList';
import { Invoice } from './types/index';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import {
  getExchangeRateToastDescription,
  getInitialLiveExchangeRate,
} from '@/components/proforma/exchange-rate';

const DEFAULT_TAX_EXCHANGE_RATE = 93.06;

type TaxInvoicesResponse = Invoice[] | { data?: Invoice[] };

function normalizeInvoicesResponse(response: TaxInvoicesResponse): Invoice[] {
  if (Array.isArray(response)) return response;
  return Array.isArray(response.data) ? response.data : [];
}

const GSTIN_STATE_MAP: Record<string, string> = {
  '01': 'JK',
  '02': 'HP',
  '03': 'PB',
  '04': 'CH',
  '05': 'UT',
  '06': 'HR',
  '07': 'DL',
  '08': 'RJ',
  '09': 'UP',
  '10': 'BR',
  '11': 'SK',
  '12': 'AS',
  '13': 'WB',
  '14': 'LD',
  '15': 'AN',
  '16': 'TN',
  '17': 'ML',
  '18': 'MN',
  '19': 'NL',
  '20': 'MZ',
  '21': 'TR',
  '22': 'MG',
  '23': 'JH',
  '24': 'GJ',
  '25': 'MP',
  '26': 'CT',
  '27': 'MH',
  '28': 'AP',
  '29': 'KA',
  '30': 'GA',
  '31': 'KL',
  '32': 'PY',
  '33': 'DD',
  '34': 'DN',
  '35': 'OD',
  '36': 'TG',
};

function getStateFromGstin(gstin: string): string {
  const code = gstin?.slice(0, 2);
  return GSTIN_STATE_MAP[code] || '';
}

function formatPdfCurrency(amount: number): string {
  return `Rs. ${Math.round(amount || 0).toLocaleString('en-IN')}`;
}

function formatPdfDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString || '-';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createTaxInvoicePdfBlob(invoice: Invoice): Blob {
  const lineItems = invoice.lineItems.length
    ? invoice.lineItems
    : [
        {
          itemCode: '-',
          description: '-',
          hsn: '-',
          quantity: 0,
          rate: 0,
          amount: 0,
          gst: 0,
          total: 0,
        },
      ];

  const lines = [
    'TAX INVOICE',
    '',
    `Invoice No: ${invoice.invoiceNumber || '-'}`,
    `Date: ${formatPdfDate(invoice.invoiceDate)}`,
    `Due Date: ${formatPdfDate(invoice.dueDate)}`,
    '',
    `Seller: ${invoice.companyName || 'Sharma Traders Pvt. Ltd.'}`,
    `Seller GSTIN: ${invoice.gstin || 'N/A'}`,
    '',
    `Bill To: ${invoice.customerName || 'No customer'}`,
    `Customer GSTIN: ${invoice.customerGstin || 'N/A'}`,
    `Place of Supply: ${invoice.placeOfSupply || invoice.state || '-'}`,
    '',
    'Item Code    Description    HSN    Qty    Rate    Amount    GST    Total',
    ...lineItems.map(
      (item) =>
        `${item.itemCode || '-'}    ${item.description || '-'}    ${item.hsn || '-'}    ${item.quantity || 0}    ${formatPdfCurrency(item.rate)}    ${formatPdfCurrency(item.amount)}    ${item.gst || 0}%    ${formatPdfCurrency(item.total || item.amount)}`,
    ),
    '',
    `Subtotal: ${formatPdfCurrency(invoice.subtotal || 0)}`,
    `Discount: ${formatPdfCurrency(invoice.discount || 0)}`,
    `Taxable Amount: ${formatPdfCurrency(invoice.taxableAmount || 0)}`,
    `Total Tax: ${formatPdfCurrency(invoice.totalTax || 0)}`,
    `Grand Total: ${formatPdfCurrency(invoice.grandTotal || invoice.amount || 0)}`,
  ];

  const content = [
    'BT',
    '/F1 11 Tf',
    '50 790 Td',
    ...lines.flatMap((line, index) => [
      index === 0 ? '' : '0 -17 Td',
      `(${escapePdfText(line)}) Tj`,
    ]),
    'ET',
  ]
    .filter(Boolean)
    .join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function downloadTaxInvoicePdf(invoice: Invoice): void {
  const url = URL.createObjectURL(createTaxInvoicePdfBlob(invoice));
  const link = document.createElement('a');

  link.href = url;
  link.download = `${invoice.invoiceNumber || 'tax-invoice'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadCreditNoteInvoiceNumbers(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem('credit_notes');
    const creditNotes = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(creditNotes)) return [];

    return Array.from(
      new Set(
        creditNotes
          .map((note) => (typeof note?.invoiceNumber === 'string' ? note.invoiceNumber : ''))
          .filter(Boolean),
      ),
    );
  } catch {
    return [];
  }
}

export default function TaxInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [creditNoteInvoiceNumbers, setCreditNoteInvoiceNumbers] = useState<string[]>(
    loadCreditNoteInvoiceNumbers,
  );
  const [newInvoiceExchangeRate, setNewInvoiceExchangeRate] = useState(DEFAULT_TAX_EXCHANGE_RATE);

  useEffect(() => {
    api
      .get<TaxInvoicesResponse>('/tax-invoices')
      .then((response) => setInvoices(normalizeInvoicesResponse(response)))
      .catch(() => setInvoices([]));
  }, []);

  const handleNewInvoice = () => {
    const shouldShowToast = !isCreatingNew;

    if (shouldShowToast) {
      const nextRateText = getInitialLiveExchangeRate();
      const nextRate = Number(nextRateText) || DEFAULT_TAX_EXCHANGE_RATE;

      setNewInvoiceExchangeRate(nextRate);
      toast.success('Exchange Rate Updated', {
        description: getExchangeRateToastDescription(nextRateText),
        id: 'new-tax-invoice',
      });
    }

    setSelectedInvoice(null);
    setIsCreatingNew(true);
    setIsEditing(false);
  };

  const handleSaveInvoice = async (invoiceData: Invoice) => {
    try {
      if (isCreatingNew) {
        const { id, ...payload } = invoiceData;
        void id;

        const dueDate = payload.dueDate
          ? new Date(payload.dueDate).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const state = payload.state || getStateFromGstin(payload.gstin) || 'MH';

        const lineItems = payload.lineItems
          .filter((item) => item.itemCode)
          .map((lineItem) => {
            const { id, ...rest } = lineItem;
            void id;

            return {
              ...rest,
              amount: rest.amount || 0,
              gst: rest.gst || 0,
              total: rest.total || 0,
            };
          });

        const body = {
          ...payload,
          dueDate,
          state,
          lineItems,
          amount: invoiceData.grandTotal || 0,
          status: 'draft',
        };

        console.log('POST PAYLOAD', body);

        const saved = await api.post<Invoice>('/tax-invoices', body);
        setInvoices((prev) => [saved, ...prev]);
        setSelectedInvoice(saved);
      } else {
        const dueDate = invoiceData.dueDate
          ? new Date(invoiceData.dueDate).toISOString()
          : undefined;

        const lineItems = invoiceData.lineItems
          .filter((item) => item.itemCode)
          .map((lineItem) => {
            const { id, ...rest } = lineItem;
            void id;

            return {
              ...rest,
              amount: rest.amount || 0,
              gst: rest.gst || 0,
              total: rest.total || 0,
            };
          });

        const body = {
          ...invoiceData,
          dueDate,
          lineItems,
          amount: invoiceData.grandTotal || 0,
        };

        console.log('PATCH PAYLOAD', body);

        const updated = await api.patch<Invoice>(`/tax-invoices/${invoiceData.id}`, body);
        setInvoices((prev) => prev.map((inv) => (inv.id === invoiceData.id ? updated : inv)));
        setSelectedInvoice(updated);
      }
      setIsCreatingNew(false);
      setIsEditing(false);
      toast.success('Invoice saved successfully');
    } catch {
      toast.error('Failed to save invoice');
    }
  };

  const handleCancelForm = () => {
    if (isCreatingNew) {
      setSelectedInvoice(null);
    }

    setIsCreatingNew(false);
    setIsEditing(false);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    try {
      const fileName = `${invoice.invoiceNumber || 'tax-invoice'}.pdf`;

      downloadTaxInvoicePdf(invoice);
      toast.success('PDF Downloaded', {
        description: `${fileName} has been downloaded successfully.`,
      });
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleSendEmail = (invoice: Invoice) => {
    toast.success(`Email sent to customer for ${invoice.invoiceNumber}`);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      const updated = await api.patch<Invoice>(`/tax-invoices/${invoice.id}`, {
        status: 'paid',
      });
      setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? updated : inv)));
      setSelectedInvoice((prev) => (prev?.id === invoice.id ? updated : prev));
      toast.success(`Marked ${invoice.invoiceNumber} as paid`);
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  const handleMarkAsSent = async (invoice: Invoice) => {
    await updateInvoiceStatus(invoice, 'sent');
  };

  const handleMarkAsDraft = async (invoice: Invoice) => {
    await updateInvoiceStatus(invoice, 'draft');
  };

  const updateInvoiceStatus = async (invoice: Invoice, status: 'sent' | 'draft') => {
    const statusInvoice: Invoice = { ...invoice, status };
    const statusLabel = status === 'sent' ? 'Sent' : 'Draft';

    setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? statusInvoice : inv)));
    setSelectedInvoice((prev) => (prev?.id === invoice.id ? statusInvoice : prev));

    try {
      const saved = await api.patch<Invoice>(`/tax-invoices/${invoice.id}`, {
        status,
      });
      const updated: Invoice = { ...invoice, ...saved, status };

      setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? updated : inv)));
      setSelectedInvoice((prev) => (prev?.id === invoice.id ? updated : prev));
      toast.success(`Marked as ${statusLabel}`, {
        description: `${invoice.invoiceNumber} has been marked as ${status}`,
      });
    } catch {
      setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? invoice : inv)));
      setSelectedInvoice((prev) => (prev?.id === invoice.id ? invoice : prev));
      toast.error(`Failed to mark as ${status}`);
    }
  };

  const createCreditNoteDraft = (invoice: Invoice): string => {
    const creditNoteNumber = `CN-${invoice.invoiceNumber.replace(/^DI-/, '')}`;
    const creditNote = {
      id: Date.now().toString(),
      creditNoteNumber,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      creditNoteDate: new Date().toISOString().split('T')[0],
      customerName: invoice.customerName,
      customerGstin: invoice.customerGstin,
      placeOfSupply: invoice.placeOfSupply,
      reason: 'Invoice adjustment',
      amount: invoice.grandTotal || invoice.amount,
      status: 'draft',
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      taxableAmount: invoice.taxableAmount,
      totalTax: invoice.totalTax,
      grandTotal: invoice.grandTotal || invoice.amount,
    };
    const saved = localStorage.getItem('credit_notes');
    const creditNotes = saved ? JSON.parse(saved) : [];
    localStorage.setItem('credit_notes', JSON.stringify([creditNote, ...creditNotes]));
    setCreditNoteInvoiceNumbers((prev) =>
      prev.includes(invoice.invoiceNumber) ? prev : [...prev, invoice.invoiceNumber],
    );

    return creditNoteNumber;
  };

  const handleCreateCreditNote = (invoice: Invoice) => {
    createCreditNoteDraft(invoice);
    toast.success(`Credit note draft created for ${invoice.invoiceNumber}`);
  };

  const handleCancelInvoice = async (
    invoice: Invoice,
    options: { createCreditNote?: boolean } = {},
  ) => {
    try {
      const creditNoteNumber = options.createCreditNote ? createCreditNoteDraft(invoice) : '';
      const updated = await api.patch<Invoice>(`/tax-invoices/${invoice.id}`, {
        status: 'cancelled',
      });
      const cancelledInvoice: Invoice = { ...invoice, ...updated, status: 'cancelled' };

      setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? cancelledInvoice : inv)));
      setSelectedInvoice((prev) => (prev?.id === invoice.id ? cancelledInvoice : prev));

      if (creditNoteNumber) {
        toast.success('Invoice Cancelled & CN Created', {
          description: `Invoice cancelled. Credit Note ${creditNoteNumber} created.`,
        });
      } else {
        toast.success('Invoice Cancelled', {
          description: `${invoice.invoiceNumber} has been cancelled.`,
        });
      }
    } catch {
      toast.error('Failed to cancel invoice');
    }
  };

  const handleReinstateInvoice = async (invoice: Invoice) => {
    await updateInvoiceStatus(invoice, 'draft');
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await api.delete(`/tax-invoices/${invoice.id}`);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
      setSelectedInvoice(null);
      toast.success('Tax Invoice Deleted', {
        description: `Invoice ${invoice.invoiceNumber} has been permanently deleted. If this was converted from a proforma, you can now convert it again.`,
      });
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditing(true);
  };

  const isFormOpen = isCreatingNew || isEditing;

  return (
    <div className="flex h-full min-w-0 overflow-hidden bg-white text-slate-950 select-none">
      <InvoiceList
        invoices={invoices}
        selectedInvoice={selectedInvoice}
        creditNoteInvoiceNumbers={creditNoteInvoiceNumbers}
        onSelectInvoice={(invoice) => {
          setSelectedInvoice(invoice);
          setIsCreatingNew(false);
          setIsEditing(false);
        }}
        onNewInvoice={handleNewInvoice}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f9fb]">
        {isFormOpen ? (
          <InvoiceForm
            invoice={selectedInvoice || undefined}
            isNew={isCreatingNew}
            initialExchangeRate={newInvoiceExchangeRate}
            onSave={handleSaveInvoice}
            onCancel={handleCancelForm}
          />
        ) : (
          <InvoiceDetailPanel
            invoice={selectedInvoice}
            onDownloadPDF={handleDownloadPDF}
            onSendEmail={handleSendEmail}
            onMarkAsPaid={handleMarkAsPaid}
            onMarkAsSent={handleMarkAsSent}
            onMarkAsDraft={handleMarkAsDraft}
            onCreateCreditNote={handleCreateCreditNote}
            onCancelInvoice={handleCancelInvoice}
            onReinstateInvoice={handleReinstateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
