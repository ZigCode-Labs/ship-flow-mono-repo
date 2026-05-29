'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CreditNote } from '@/app/(dashboard)/domestic/notes/types';

interface CreditNotePreviewProps {
  creditNote: CreditNote;
  sellerName?: string;
  sellerGstin?: string;
}

interface DetailRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

interface SummaryRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

const rupee = '\u20b9';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  return `${rupee}${Math.round(amount || 0).toLocaleString('en-IN')}`;
};

const formatQuantity = (quantity: number): string => {
  return `${Number(quantity || 0).toFixed(2)} PCS`;
};

const toWordsBelowThousand = (value: number): string => {
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
  if (value < 100) return `${tens[Math.floor(value / 10)]} ${ones[value % 10]}`.trim();

  return `${ones[Math.floor(value / 100)]} Hundred ${toWordsBelowThousand(value % 100)}`.trim();
};

const amountToWords = (amount: number): string => {
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
};

const DetailRow = ({ label, value, strong = false }: DetailRowProps) => (
  <div className="grid grid-cols-[120px_1fr] items-baseline gap-3 text-right">
    <span className="text-[14px] text-slate-600">{label}</span>
    <span className={strong ? 'text-[14px] font-bold text-black' : 'text-[14px] text-black'}>
      {value}
    </span>
  </div>
);

const SummaryRow = ({ label, value, strong = false }: SummaryRowProps) => (
  <div
    className={
      strong
        ? 'flex justify-between gap-10 border-t border-slate-300 pt-2 font-bold'
        : 'flex justify-between gap-10'
    }
  >
    <span className="text-slate-700">{label}</span>
    <span className={strong ? 'text-emerald-600' : 'text-black'}>{value}</span>
  </div>
);

export const CreditNotePreview = ({
  creditNote,
  sellerName = 'global tech company',
  sellerGstin = '',
}: CreditNotePreviewProps) => {
  const lineItems = creditNote.lineItems.length > 0 ? creditNote.lineItems : [];

  return (
    <article className="mx-auto w-full max-w-[896px] border border-slate-300 bg-white px-8 py-8 text-black shadow-sm">
      <header className="flex items-start justify-between border-b border-slate-200 pb-7">
        <div>
          <h2 className="text-[20px] font-bold leading-7">{sellerName}</h2>
          <p className="text-[12px] text-slate-600">GSTIN: {sellerGstin}</p>
        </div>

        <div className="text-right">
          <h1 className="mb-3 text-[24px] font-extrabold leading-7 tracking-wide text-slate-900">
            CREDIT NOTE
          </h1>
          <div className="flex flex-col gap-2">
            <DetailRow label="CN No:" value={creditNote.creditNoteNumber} strong />
            <DetailRow label="Date:" value={formatDate(creditNote.creditNoteDate)} />
            <DetailRow label="Original Invoice No:" value={creditNote.invoiceNumber} strong />
            <DetailRow label="Reason:" value={creditNote.reason} strong />
          </div>
        </div>
      </header>

      <section className="mt-8 w-full max-w-[400px] rounded-[3px] border border-slate-200 px-4 py-4">
        <h3 className="border-b border-slate-200 pb-1 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Bill To
        </h3>
        {creditNote.customerName && (
          <p className="mt-3 text-[14px] font-semibold text-black">{creditNote.customerName}</p>
        )}
        <div className="mt-3 flex flex-col gap-2 text-[14px] text-slate-600">
          <p>GSTIN: {creditNote.customerGstin}</p>
          <p>Place of Supply: {creditNote.placeOfSupply}</p>
        </div>
      </section>

      <section className="mt-8">
        <Table className="text-[14px]">
          <TableHeader className="bg-slate-100">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="h-9 w-10 border-r-0 px-2 py-2 font-bold text-black">
                #
              </TableHead>
              <TableHead className="h-9 border-r-0 px-2 py-2 font-bold text-black">
                Item Code
              </TableHead>
              <TableHead className="h-9 border-r-0 px-2 py-2 font-bold text-black">
                Description
              </TableHead>
              <TableHead className="h-9 border-r-0 px-2 py-2 text-center font-bold text-black">
                HSN
              </TableHead>
              <TableHead className="h-9 border-r-0 px-2 py-2 text-center font-bold text-black">
                Qty
              </TableHead>
              <TableHead className="h-9 border-r-0 px-2 py-2 text-right font-bold text-black">
                Rate
              </TableHead>
              <TableHead className="h-9 border-r-0 px-2 py-2 text-right font-bold text-black">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item, index) => (
              <TableRow
                key={item.id || `${item.description}-${index}`}
                className="border-slate-200 hover:bg-transparent"
              >
                <TableCell className="border-r-0 px-2 py-2 text-slate-700">{index + 1}</TableCell>
                <TableCell className="border-r-0 px-2 py-2">{item.itemCode || '-'}</TableCell>
                <TableCell className="border-r-0 px-2 py-2">{item.description || '-'}</TableCell>
                <TableCell className="border-r-0 px-2 py-2 text-center">
                  {item.hsn || '-'}
                </TableCell>
                <TableCell className="border-r-0 px-2 py-2 text-center">
                  {formatQuantity(item.quantity)}
                </TableCell>
                <TableCell className="border-r-0 px-2 py-2 text-right">
                  {formatCurrency(item.rate)}
                </TableCell>
                <TableCell className="border-r-0 px-2 py-2 text-right">
                  {formatCurrency(item.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="mt-7 ml-auto w-full max-w-[320px] text-[14px]">
        <div className="flex flex-col gap-3">
          <SummaryRow label="Subtotal:" value={formatCurrency(creditNote.subtotal)} />
          <SummaryRow label="Taxable Amount:" value={formatCurrency(creditNote.taxableAmount)} />
          <SummaryRow label="CGST:" value={formatCurrency(0)} />
          <SummaryRow label="SGST:" value={formatCurrency(0)} />
          <SummaryRow label="Grand Total:" value={formatCurrency(creditNote.grandTotal)} strong />
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-[12px]">
        <span className="font-bold uppercase tracking-wide text-slate-600">Amount in Words: </span>
        <span className="font-semibold italic text-black">
          {amountToWords(creditNote.grandTotal)}
        </span>
      </footer>
    </article>
  );
};
