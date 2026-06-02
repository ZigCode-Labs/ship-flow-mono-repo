'use client';

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Invoice } from '@/app/(dashboard)/domestic/invoices/types';

function fmt(amount: number): string {
  return `Rs. ${Math.round(amount || 0).toLocaleString('en-IN')}`;
}

function fmtDate(value: string): string {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function wordsBelowThousand(value: number): string {
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

  return `${ones[Math.floor(value / 100)]} Hundred ${wordsBelowThousand(value % 100)}`.trim();
}

function amountToWords(amount: number): string {
  const rounded = Math.round(amount || 0);
  if (rounded === 0) return 'Rupees Zero Only';

  const parts: string[] = [];
  let remaining = rounded;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  if (crore) parts.push(`${wordsBelowThousand(crore)} Crore`);
  if (lakh) parts.push(`${wordsBelowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${wordsBelowThousand(thousand)} Thousand`);
  if (remaining) parts.push(wordsBelowThousand(remaining));

  return `Rupees ${parts.join(' ')} Only`;
}

function lineGstRate(item: Invoice['lineItems'][number]): number {
  if (item.gst <= 100) return item.gst;
  if (!item.amount) return 0;

  return Math.round((item.gst / item.amount) * 100);
}

function isIntrastateInvoice(invoice: Invoice): boolean {
  const sellerStateCode = invoice.gstin?.slice(0, 2);
  const customerStateCode = invoice.customerGstin?.slice(0, 2);

  if (sellerStateCode && customerStateCode) {
    return sellerStateCode === customerStateCode;
  }

  return Boolean(invoice.state && invoice.placeOfSupply && invoice.state === invoice.placeOfSupply);
}

const c = {
  border: '#cbd5e1',
  borderSoft: '#e2e8f0',
  header: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  label: '#334155',
  green: '#047857',
  red: '#dc2626',
};

const s = StyleSheet.create({
  page: {
    padding: 22,
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: c.text,
    backgroundColor: '#ffffff',
  },
  frame: {
    minHeight: '100%',
    borderWidth: 1,
    borderColor: c.border,
    padding: 9,
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: 330,
    left: 84,
    fontSize: 42,
    fontFamily: 'Helvetica-Bold',
    color: '#e5e7eb',
    opacity: 0.55,
    transform: 'rotate(-32deg)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  logoBox: {
    width: 104,
    height: 39,
    borderWidth: 1,
    borderColor: c.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 6,
    color: '#94a3b8',
  },
  companyBlock: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  companyGstin: {
    marginTop: 2,
    fontSize: 6,
    color: c.muted,
  },
  titleBar: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.header,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  section: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.border,
    padding: 8,
    minHeight: 68,
  },
  sectionCompact: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.border,
    padding: 8,
    minHeight: 58,
  },
  sectionTitle: {
    fontSize: 5.8,
    fontFamily: 'Helvetica-Bold',
    color: c.label,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  partyName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  mutedLine: {
    fontSize: 6.5,
    color: c.muted,
    marginBottom: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 6.5,
    color: c.muted,
  },
  detailValue: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 0,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: c.header,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.borderSoft,
  },
  th: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
  },
  td: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    fontSize: 6.5,
  },
  tdBold: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
  },
  cIndex: { width: '5%' },
  cCode: { width: '11%' },
  cDesc: { width: '27%' },
  cHsn: { width: '10%' },
  cQty: { width: '8%', textAlign: 'right' },
  cRate: { width: '11%', textAlign: 'right' },
  cAmount: { width: '12%', textAlign: 'right' },
  cGst: { width: '7%', textAlign: 'right' },
  cTotal: { width: '9%', textAlign: 'right' },
  summaryWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 0,
    marginBottom: 9,
  },
  summaryBox: {
    width: 150,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  summaryTitle: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: c.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    color: c.muted,
    fontSize: 6.5,
  },
  summaryValue: {
    fontSize: 6.5,
  },
  summaryDiscount: {
    fontSize: 6.5,
    color: c.red,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: c.borderSoft,
    marginVertical: 4,
  },
  grandLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  grandValue: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: c.green,
  },
  amountWords: {
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 7,
    paddingVertical: 6,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 4,
  },
  amountWordsLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
  },
  amountWordsValue: {
    fontSize: 6.5,
    fontStyle: 'italic',
  },
  signatoryWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  signatoryBox: {
    width: 148,
    minHeight: 78,
    borderWidth: 1,
    borderColor: c.border,
    padding: 9,
    alignItems: 'center',
  },
  signatoryTitle: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: c.label,
    marginBottom: 23,
    textTransform: 'uppercase',
  },
  signatoryName: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  signatoryFor: {
    fontSize: 6.2,
    color: c.muted,
  },
  footer: {
    position: 'absolute',
    left: 9,
    right: 9,
    bottom: 9,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  footerText: {
    fontSize: 6,
    color: c.muted,
  },
});

function SummaryRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'discount' | 'grand';
}) {
  return (
    <View style={s.summaryRow}>
      <Text style={tone === 'grand' ? s.grandLabel : s.summaryLabel}>{label}</Text>
      <Text
        style={
          tone === 'grand' ? s.grandValue : tone === 'discount' ? s.summaryDiscount : s.summaryValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

export function TaxInvoicePDF({ invoice }: { invoice: Invoice }) {
  const companyName = invoice.companyName || 'Sharma Traders Pvt. Ltd.';
  const total = invoice.grandTotal || invoice.amount || 0;
  const items = invoice.lineItems?.length
    ? invoice.lineItems
    : [
        {
          id: '-',
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

  const intrastate = isIntrastateInvoice(invoice);
  const cgst = intrastate ? (invoice.totalTax || 0) / 2 : 0;
  const sgst = intrastate ? (invoice.totalTax || 0) / 2 : 0;
  const igst = intrastate ? 0 : invoice.totalTax || 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.frame}>
          <Text style={s.watermark}>TRIAL VERSION</Text>

          <View style={s.topBar}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>Logo</Text>
            </View>
            <View style={s.companyBlock}>
              <Text style={s.companyName}>{companyName}</Text>
              <Text style={s.companyGstin}>GSTIN: {invoice.gstin || 'N/A'}</Text>
            </View>
          </View>

          <View style={s.titleBar}>
            <Text style={s.title}>TAX INVOICE</Text>
          </View>

          <View style={s.row}>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Bill To</Text>
              <Text style={s.partyName}>{invoice.customerName || 'N/A'}</Text>
              <Text style={s.mutedLine}>Address not provided</Text>
              <Text style={s.mutedLine}>GSTIN: {invoice.customerGstin || 'N/A'}</Text>
              <Text style={s.mutedLine}>
                Place of Supply: {invoice.placeOfSupply || invoice.state || 'N/A'}
              </Text>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Invoice Details</Text>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Invoice No:</Text>
                <Text style={s.detailValue}>{invoice.invoiceNumber || 'N/A'}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Invoice Date:</Text>
                <Text style={s.detailValue}>{fmtDate(invoice.invoiceDate)}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Due Date:</Text>
                <Text style={s.detailValue}>{fmtDate(invoice.dueDate)}</Text>
              </View>
              {invoice.reference ? (
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Reference:</Text>
                  <Text style={s.detailValue}>{invoice.reference}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={s.table}>
            <View style={s.tableHead}>
              <Text style={[s.th, s.cIndex]}>#</Text>
              <Text style={[s.th, s.cCode]}>Item Code</Text>
              <Text style={[s.th, s.cDesc]}>Description</Text>
              <Text style={[s.th, s.cHsn]}>HSN</Text>
              <Text style={[s.th, s.cQty]}>Qty</Text>
              <Text style={[s.th, s.cRate]}>Rate</Text>
              <Text style={[s.th, s.cAmount]}>Amount</Text>
              <Text style={[s.th, s.cGst]}>GST %</Text>
              <Text style={[s.th, s.cTotal]}>Total</Text>
            </View>
            {items.map((item, index) => (
              <View key={item.id || `${item.itemCode}-${index}`} style={s.tableRow}>
                <Text style={[s.td, s.cIndex]}>{index + 1}</Text>
                <Text style={[s.td, s.cCode]}>{item.itemCode || '-'}</Text>
                <Text style={[s.td, s.cDesc]}>{item.description || '-'}</Text>
                <Text style={[s.td, s.cHsn]}>{item.hsn || '-'}</Text>
                <Text style={[s.td, s.cQty]}>{item.quantity || 0} PCS</Text>
                <Text style={[s.td, s.cRate]}>{fmt(item.rate)}</Text>
                <Text style={[s.td, s.cAmount]}>{fmt(item.amount)}</Text>
                <Text style={[s.td, s.cGst]}>{lineGstRate(item)}%</Text>
                <Text style={[s.tdBold, s.cTotal]}>{fmt(item.total || item.amount)}</Text>
              </View>
            ))}
          </View>

          <View style={s.summaryWrap}>
            <View style={s.summaryBox}>
              <Text style={s.summaryTitle}>Summary</Text>
              <SummaryRow label="Subtotal:" value={fmt(invoice.subtotal || 0)} />
              <SummaryRow
                label="Discount:"
                value={`- ${fmt(invoice.discount || 0)}`}
                tone="discount"
              />
              <SummaryRow label="Taxable Amount:" value={fmt(invoice.taxableAmount || 0)} />
              <View style={s.summaryDivider} />
              {intrastate ? (
                <>
                  <SummaryRow label="CGST:" value={fmt(cgst)} />
                  <SummaryRow label="SGST:" value={fmt(sgst)} />
                </>
              ) : (
                <SummaryRow label="IGST:" value={fmt(igst)} />
              )}
              <SummaryRow label="Total Tax:" value={fmt(invoice.totalTax || 0)} />
              <View style={s.summaryDivider} />
              <SummaryRow label="Grand Total:" value={fmt(total)} tone="grand" />
            </View>
          </View>

          <View style={s.amountWords}>
            <Text style={s.amountWordsLabel}>Amount in Words:</Text>
            <Text style={s.amountWordsValue}>{amountToWords(total)}</Text>
          </View>

          <View style={s.row}>
            <View style={s.sectionCompact}>
              <Text style={s.sectionTitle}>Bank Details</Text>
              <Text style={s.mutedLine}>Bank Name: {invoice.bankName || 'N/A'}</Text>
              <Text style={s.mutedLine}>Account No: {invoice.accountNumber || 'N/A'}</Text>
              <Text style={s.mutedLine}>IFSC Code: {invoice.ifscCode || 'N/A'}</Text>
              <Text style={s.mutedLine}>Branch: {invoice.branch || 'N/A'}</Text>
            </View>
            <View style={s.sectionCompact}>
              <Text style={s.sectionTitle}>Terms & Notes</Text>
              <Text style={s.mutedLine}>
                {invoice.notes || invoice.paymentTerms || 'No terms or notes specified.'}
              </Text>
            </View>
          </View>

          <View style={s.signatoryWrap}>
            <View style={s.signatoryBox}>
              <Text style={s.signatoryTitle}>Authorized Signatory</Text>
              <Text style={s.signatoryName}>Authorized Signatory</Text>
              <Text style={s.signatoryFor}>For {companyName}</Text>
            </View>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>India</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
