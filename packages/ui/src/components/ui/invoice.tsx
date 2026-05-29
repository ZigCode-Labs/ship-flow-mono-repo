'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

// Utility to convert number to words in Indian System
export function numberToWords(num: number): string {
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Rupees Zero Only';

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

  const helper = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += ones[n] + ' ';
      } else {
        str += tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
      }
    }
    return str;
  };

  const convertIndian = (amount: number): string => {
    let remaining = amount;
    let crore = Math.floor(remaining / 10000000);
    remaining %= 10000000;
    let lakh = Math.floor(remaining / 100000);
    remaining %= 100000;
    let thousand = Math.floor(remaining / 1000);
    remaining %= 1000;
    let hundred = remaining;

    let res = '';
    if (crore > 0) res += helper(crore) + 'Crore ';
    if (lakh > 0) res += helper(lakh) + 'Lakh ';
    if (thousand > 0) res += helper(thousand) + 'Thousand ';
    if (hundred > 0) res += helper(hundred);

    return res.trim();
  };

  let result = 'Rupees ' + convertIndian(rupees);
  if (paise > 0) {
    result += ' and ' + convertIndian(paise) + ' Paise';
  }
  result += ' Only';
  return result;
}

// 1. A4 Container Sheet
export interface InvoicePaperProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InvoicePaper = React.forwardRef<HTMLDivElement, InvoicePaperProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full max-w-[850px] bg-white border border-gray-200/80 shadow-md p-8 md:p-12 text-slate-800 text-xs font-sans print:border-none print:shadow-none print:p-0 select-text',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
InvoicePaper.displayName = 'InvoicePaper';

// 2. Invoice Header (Logo, Seller Name, Seller GSTIN)
export interface InvoiceHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  sellerName: string;
  sellerGstin: string;
  logoUrl?: string;
}

export const InvoiceHeader = React.forwardRef<HTMLDivElement, InvoiceHeaderProps>(
  ({ className, sellerName, sellerGstin, logoUrl, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex justify-between items-start border border-slate-200 p-4 mb-4',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 border border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 font-semibold tracking-wider rounded-sm select-none">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              'No Logo'
            )}
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-tight text-slate-800">
              {sellerName}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            GSTIN
          </span>
          <span className="text-xs font-bold text-slate-700">{sellerGstin || 'N/A'}</span>
        </div>
      </div>
    );
  },
);
InvoiceHeader.displayName = 'InvoiceHeader';

// 3. Document Type Banner
export const InvoiceTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border-x border-b border-slate-200 py-2.5 text-center font-bold tracking-widest text-slate-800 uppercase bg-slate-50/50 mb-4 border-t',
          className,
        )}
        {...props}
      >
        {children || 'Proforma Invoice'}
      </div>
    );
  },
);
InvoiceTitle.displayName = 'InvoiceTitle';

// 4. Billing and Invoice Details Layout
export interface InvoiceBillingProps extends React.HTMLAttributes<HTMLDivElement> {
  customerName: string;
  customerGstin: string;
  customerAddress?: string;
  proformaNumber: string;
  date: string | Date;
  validUntil?: string | Date;
}

export const InvoiceBilling = React.forwardRef<HTMLDivElement, InvoiceBillingProps>(
  (
    {
      className,
      customerName,
      customerGstin,
      customerAddress,
      proformaNumber,
      date,
      validUntil,
      ...props
    },
    ref,
  ) => {
    const formatDate = (d?: string | Date) => {
      if (!d) return 'N/A';
      try {
        return new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return 'N/A';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid grid-cols-2 border border-slate-200 mb-4 divide-x divide-slate-200',
          className,
        )}
        {...props}
      >
        {/* Left Column: BILL TO */}
        <div className="p-4 flex flex-col gap-1">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            BILL TO
          </h3>
          <span className="text-sm font-bold text-slate-800">{customerName || 'N/A'}</span>
          <span className="text-slate-500 font-normal leading-relaxed">
            {customerAddress || 'Address not provided'}
          </span>
          <div className="mt-1">
            <span className="font-semibold text-slate-700">GSTIN: </span>
            <span className="font-bold text-slate-800">{customerGstin || 'N/A'}</span>
          </div>
        </div>

        {/* Right Column: INVOICE DETAILS */}
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            INVOICE DETAILS
          </h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-slate-500 font-medium">Proforma No.:</span>
            <span className="font-bold text-slate-800 text-right">{proformaNumber || 'N/A'}</span>

            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-semibold text-slate-700 text-right">{formatDate(date)}</span>

            <span className="text-slate-500 font-medium">Valid Until:</span>
            <span className="font-semibold text-slate-700 text-right">
              {formatDate(validUntil)}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
InvoiceBilling.displayName = 'InvoiceBilling';

// 5. Line Items Table Component
export interface InvoiceItem {
  id?: string;
  itemCode: string;
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  amount: number;
  gstPercent: number;
  total: number;
}

export interface InvoiceTableProps extends React.HTMLAttributes<HTMLTableElement> {
  items: InvoiceItem[];
}

export const InvoiceTable = React.forwardRef<HTMLTableElement, InvoiceTableProps>(
  ({ className, items = [], ...props }, ref) => {
    return (
      <div className="border border-slate-200 rounded-sm mb-4 overflow-hidden">
        <table ref={ref} className={cn('w-full border-collapse text-left', className)} {...props}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
              <th className="px-3 py-2 text-center w-8">#</th>
              <th className="px-3 py-2">Item Code</th>
              <th className="px-3 py-2 w-[40%]">Description</th>
              <th className="px-3 py-2 text-center">HSN</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Rate</th>
              <th className="px-3 py-2 text-right">GST</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium italic">
                  No line items found.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/30">
                  <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{item.itemCode || '-'}</td>
                  <td className="px-3 py-2.5 leading-relaxed">{item.description}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-[11px]">
                    {item.hsn || '-'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                    {item.qty} PCS
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap">
                    ₹
                    {item.rate.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-500 whitespace-nowrap">
                    {item.gstPercent}%
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-slate-800">
                    ₹
                    {item.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  },
);
InvoiceTable.displayName = 'InvoiceTable';

// 6. Invoice Summary Block (Totals)
export interface InvoiceSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  subtotal: number;
  discountAmount?: number;
  taxableAmount: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalTax: number;
  grandTotal: number;
}

export const InvoiceSummary = React.forwardRef<HTMLDivElement, InvoiceSummaryProps>(
  (
    {
      className,
      subtotal,
      discountAmount = 0,
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      grandTotal,
      ...props
    },
    ref,
  ) => {
    const formatCurrency = (val: number) =>
      '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div ref={ref} className={cn('flex justify-end mb-4', className)} {...props}>
        <div className="w-[300px] border border-slate-200 rounded-sm divide-y divide-slate-100 bg-white">
          <div className="bg-slate-50/50 py-1.5 px-3 font-semibold text-[9px] uppercase tracking-wider text-slate-500">
            SUMMARY
          </div>

          <div className="flex justify-between py-2 px-3 text-slate-600 font-medium">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between py-2 px-3 text-red-500 font-semibold">
              <span>Discount:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 px-3 text-slate-600 font-medium">
            <span>Taxable Amount:</span>
            <span>{formatCurrency(taxableAmount)}</span>
          </div>

          {cgst !== undefined && cgst > 0 && (
            <div className="flex justify-between py-2 px-3 text-slate-500">
              <span>CGST:</span>
              <span>{formatCurrency(cgst)}</span>
            </div>
          )}

          {sgst !== undefined && sgst > 0 && (
            <div className="flex justify-between py-2 px-3 text-slate-500">
              <span>SGST:</span>
              <span>{formatCurrency(sgst)}</span>
            </div>
          )}

          {igst !== undefined && igst > 0 && (
            <div className="flex justify-between py-2 px-3 text-slate-500">
              <span>IGST:</span>
              <span>{formatCurrency(igst)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 px-3 text-slate-600 font-medium">
            <span>Total Tax:</span>
            <span>{formatCurrency(totalTax)}</span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3 bg-emerald-50/80 text-emerald-800 border-t border-emerald-100 font-bold text-sm">
            <span>Grand Total:</span>
            <span className="text-base font-extrabold">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    );
  },
);
InvoiceSummary.displayName = 'InvoiceSummary';

// 7. Invoice Footer Block (Bank details, Terms, Signature, Contact)
export interface InvoiceFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  grandTotal: number;
  bankDetails?: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
  };
  terms?: string;
  sellerCompanyName: string;
  sellerAddress?: string;
  sellerEmail?: string;
  sellerPhone?: string;
}

export const InvoiceFooter = React.forwardRef<HTMLDivElement, InvoiceFooterProps>(
  (
    {
      className,
      grandTotal,
      bankDetails,
      terms,
      sellerCompanyName,
      sellerAddress,
      sellerEmail,
      sellerPhone,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* Amount in words */}
        <div className="border border-slate-200 bg-slate-50/50 py-2.5 px-4 rounded-sm font-bold text-slate-700">
          AMOUNT IN WORDS:{' '}
          <span className="font-semibold text-slate-500 uppercase tracking-tight text-[11px] ml-1">
            {numberToWords(grandTotal)}
          </span>
        </div>

        {/* Bank details and Terms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-200 p-4 rounded-sm">
            <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              BANK DETAILS
            </h4>
            <div className="space-y-1 text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Bank Name:</span>
                <span className="font-bold text-slate-700">{bankDetails?.bankName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Account No:</span>
                <span className="font-bold text-slate-700">{bankDetails?.accountNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>IFSC Code:</span>
                <span className="font-bold text-slate-700">{bankDetails?.ifscCode || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 p-4 rounded-sm">
            <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              TERMS & NOTES
            </h4>
            <p className="text-slate-500 whitespace-pre-line leading-relaxed font-normal">
              {terms || 'No terms or notes specified'}
            </p>
          </div>
        </div>

        {/* Signature Area */}
        <div className="flex justify-end pt-4">
          <div className="w-[200px] border border-slate-200 rounded-sm text-center">
            <div className="bg-slate-50/50 py-1.5 font-bold text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-200 select-none">
              AUTHORIZED SIGNATORY
            </div>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px] select-none">
              {/* Box for signature */}
              Signature
            </div>
            <div className="bg-slate-50/50 py-2 border-t border-slate-100 text-slate-600">
              <span className="font-bold block text-[10px]">Authorized Signatory</span>
              <span className="text-[9px] text-slate-400 font-medium">For {sellerCompanyName}</span>
            </div>
          </div>
        </div>

        {/* Footer address and info */}
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <div className="max-w-[60%] leading-relaxed">
            {sellerAddress || 'Nehru police station, Mumbai, Maharashtra, 400001, India'}
          </div>
          <div className="text-right">
            {sellerEmail || 'sanketm2412@gmail.com'} | {sellerPhone || '+91 9136282820'}
          </div>
        </div>
      </div>
    );
  },
);
InvoiceFooter.displayName = 'InvoiceFooter';
