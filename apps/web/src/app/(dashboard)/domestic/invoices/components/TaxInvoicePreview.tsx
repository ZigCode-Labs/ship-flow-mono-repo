'use client';

import type { ReactNode } from 'react';
import { Invoice } from '../types';

interface TaxInvoicePreviewProps {
  invoice: Invoice;
}

interface SummaryRowProps {
  label: string;
  value: string;
  tone?: 'default' | 'discount' | 'strong';
}

const rupee = '\u20b9';

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `${rupee}${Math.round(amount || 0).toLocaleString('en-IN')}`;
}

function getLineGstRate(item: Invoice['lineItems'][number]): number {
  if (item.gst <= 100) return item.gst;
  if (!item.amount) return 0;
  return Math.round((item.gst / item.amount) * 100);
}

function toWordsBelowThousand(value: number): string {
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

  if (value < 20) return ones[value];
  if (value < 100) {
    return `${tens[Math.floor(value / 10)]} ${ones[value % 10]}`.trim();
  }

  return `${ones[Math.floor(value / 100)]} Hundred ${toWordsBelowThousand(value % 100)}`.trim();
}

function amountToWords(amount: number): string {
  const roundedAmount = Math.round(amount || 0);
  if (roundedAmount === 0) return 'Rupees Zero Only';

  const parts: string[] = [];
  let remaining = roundedAmount;
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  if (crore) parts.push(`${toWordsBelowThousand(crore)} Crore`);
  if (lakh) parts.push(`${toWordsBelowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${toWordsBelowThousand(thousand)} Thousand`);
  if (remaining) parts.push(toWordsBelowThousand(remaining));

  return `Rupees ${parts.join(' ')} Only`;
}

function SummaryRow({ label, value, tone = 'default' }: SummaryRowProps) {
  return (
    <div className={`flex justify-between gap-4 ${tone === 'strong' ? 'font-bold' : ''}`}>
      <span className="text-slate-600">{label}</span>
      <span
        className={
          tone === 'discount'
            ? 'text-red-600'
            : tone === 'strong'
              ? 'text-emerald-700'
              : 'text-slate-900'
        }
      >
        {value}
      </span>
    </div>
  );
}

function SectionBox({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-slate-300 bg-white p-3 ${className}`}>
      <h3 className="mb-2 border-b border-slate-200 pb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function TaxInvoicePreview({ invoice }: TaxInvoicePreviewProps) {
  const companyName = invoice.companyName || 'global tech company';
  const gstin = invoice.gstin || 'N/A';
  const total = invoice.grandTotal || invoice.amount || 0;
  const lineItems = invoice.lineItems ?? [];

  return (
    <div className="mx-auto w-full max-w-[640px] bg-white text-[10px] text-slate-900 shadow-sm ring-1 ring-slate-300">
      <div className="flex items-start justify-between border-b border-slate-300 px-5 py-4">
        <div className="flex h-14 w-24 items-center justify-center rounded-sm border border-slate-300 bg-slate-50 text-[9px] text-slate-400">
          No Logo
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-900">{companyName}</p>
          <p className="mt-1 text-[9px] text-slate-600">GSTIN: {gstin}</p>
        </div>
      </div>

      <div className="border-b border-slate-300 bg-slate-50 py-2 text-center text-sm font-extrabold tracking-wide">
        TAX INVOICE
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <SectionBox title="Bill To">
            <p className="text-xs font-bold">{invoice.customerName || 'N/A'}</p>
            <div className="mt-2 space-y-0.5 text-[10px] leading-4 text-slate-600">
              <p>Address not provided</p>
              <p>GSTIN: {invoice.customerGstin || 'N/A'}</p>
            </div>
          </SectionBox>

          <SectionBox title="Invoice Details">
            <div className="space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Invoice No:</span>
                <span className="font-bold">{invoice.invoiceNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Date:</span>
                <span>{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Due Date:</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </SectionBox>
        </div>

        <div className="overflow-x-auto border border-slate-300">
          <table className="min-w-[600px] w-full border-collapse text-[9px]">
            <thead className="bg-slate-100 text-slate-800">
              <tr className="border-b border-slate-300">
                <th className="w-8 px-2 py-2 text-left font-bold">#</th>
                <th className="px-2 py-2 text-left font-bold">Item Code</th>
                <th className="px-2 py-2 text-left font-bold">Description</th>
                <th className="px-2 py-2 text-right font-bold">HSN</th>
                <th className="px-2 py-2 text-right font-bold">Qty</th>
                <th className="px-2 py-2 text-right font-bold">Rate</th>
                <th className="px-2 py-2 text-right font-bold">Amount</th>
                <th className="px-2 py-2 text-right font-bold">GST</th>
                <th className="px-2 py-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr
                  key={item.id || `${item.itemCode}-${index}`}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <td className="px-2 py-2 text-slate-600">{index + 1}</td>
                  <td className="px-2 py-2 font-medium">{item.itemCode || '-'}</td>
                  <td className="px-2 py-2">{item.description || '-'}</td>
                  <td className="px-2 py-2 text-right">{item.hsn || '-'}</td>
                  <td className="px-2 py-2 text-right">{item.quantity}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(item.rate)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(item.amount)}</td>
                  <td className="px-2 py-2 text-right">{getLineGstRate(item)}%</td>
                  <td className="px-2 py-2 text-right font-bold">
                    {formatCurrency(item.total || item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <SectionBox title="Summary" className="w-full max-w-[230px]">
            <div className="space-y-2">
              <SummaryRow label="Subtotal:" value={formatCurrency(invoice.subtotal || 0)} />
              <SummaryRow
                label="Discount:"
                value={formatCurrency(invoice.discount || 0)}
                tone="discount"
              />
              <SummaryRow
                label="Taxable Amount:"
                value={formatCurrency(invoice.taxableAmount || 0)}
              />
              <SummaryRow label="CGST:" value={formatCurrency(0)} />
              <SummaryRow label="SGST:" value={formatCurrency(0)} />
              <div className="border-t border-slate-300 pt-2">
                <SummaryRow label="Total Tax:" value={formatCurrency(invoice.totalTax || 0)} />
              </div>
              <div className="border-t border-slate-300 pt-2 text-xs">
                <SummaryRow label="Grand Total:" value={formatCurrency(total)} tone="strong" />
              </div>
            </div>
          </SectionBox>
        </div>

        <div className="border border-slate-300 p-3">
          <span className="font-bold uppercase tracking-[0.12em]">Amount in Words: </span>
          <span className="italic">{amountToWords(total)}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SectionBox title="Bank Details">
            <div className="space-y-1.5 text-[10px] leading-4 text-slate-700">
              <p>Bank Name: {invoice.bankName || 'N/A'}</p>
              <p>Account No: {invoice.accountNumber || 'N/A'}</p>
              <p>IFSC Code: {invoice.ifscCode || 'N/A'}</p>
            </div>
          </SectionBox>
          <SectionBox title="Terms & Notes">
            <p className="text-[10px] italic leading-4 text-slate-500">
              {invoice.notes || invoice.paymentTerms || 'No terms or notes specified'}
            </p>
          </SectionBox>
        </div>

        <div className="flex justify-end">
          <div className="w-44 border border-slate-300 p-4 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em]">Authorized Signatory</p>
            <div className="my-8 border-t border-slate-300" />
            <p className="text-[10px] font-medium">Authorized Signatory</p>
            <p className="mt-1 text-[9px] text-slate-500">For {companyName}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-300 px-5 py-2 text-[9px] text-slate-500">
        <span>bazids police station, Mumbai, Maharashtra, 400001, India</span>
        <span>reacher8627@gmail.com &nbsp; +91 9898989898</span>
      </div>
    </div>
  );
}
