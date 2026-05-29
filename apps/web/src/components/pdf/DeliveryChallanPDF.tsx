'use client';

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

interface LineItem {
  id?: string;
  itemCode?: string;
  description?: string;
  hsn?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  amount?: number;
  gst?: number;
  total?: number;
}

interface DeliveryChallan {
  challanNumber?: string;
  challanDate?: string;
  deliveryDate?: string;
  status?: string;
  deliveryType?: string;
  companyName?: string;
  gstin?: string;
  state?: string;
  customerName?: string;
  customerGstin?: string;
  buyerAddress?: string;
  placeOfSupply?: string;
  reference?: string;
  notes?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  discount?: number;
  taxableAmount?: number;
  totalTax?: number;
  grandTotal?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: number): string {
  return `Rs. ${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(ds?: string): string {
  if (!ds) return 'N/A';
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function belowThousand(n: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n < 20) return ones[n];
  if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  return `${ones[Math.floor(n / 100)]} Hundred ${belowThousand(n % 100)}`.trim();
}

function amountToWords(amount: number): string {
  const n = Math.round(amount || 0);
  if (n === 0) return 'Rupees Zero Only';
  const parts: string[] = [];
  let r = n;
  const crore = Math.floor(r / 10_000_000); r %= 10_000_000;
  const lakh  = Math.floor(r / 100_000);    r %= 100_000;
  const thou  = Math.floor(r / 1_000);      r %= 1_000;
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh)  parts.push(`${belowThousand(lakh)} Lakh`);
  if (thou)  parts.push(`${belowThousand(thou)} Thousand`);
  if (r)     parts.push(belowThousand(r));
  return `Rupees ${parts.join(' ')} Only`;
}

const DELIVERY_TYPE_LABEL: Record<string, string> = {
  supply_of_goods: 'Supply of Goods',
  others: 'Others',
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  border:      '#cbd5e1',
  borderLight: '#e2e8f0',
  bg:          '#ffffff',
  bgSubtle:    '#f8fafc',
  bgTableHead: '#f1f5f9',
  text:        '#0f172a',
  secondary:   '#475569',
  muted:       '#64748b',
  label:       '#334155',
  blue:        '#1d4ed8',
  green:       '#047857',
  red:         '#dc2626',
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.text,
    paddingHorizontal: 30,
    paddingVertical: 30,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 10,
  },
  companyName: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  gstin:       { fontSize: 7.5, color: C.secondary, marginTop: 3 },
  logoBox: {
    width: 56,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { fontSize: 7, color: '#94a3b8' },

  // Title bar
  titleBar: {
    backgroundColor: C.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 7,
    marginBottom: 10,
    alignItems: 'center',
  },
  titleText:  { fontSize: 12, fontFamily: 'Helvetica-Bold', letterSpacing: 1.5 },
  badgeRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 4, gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
  },
  badgeText:  { fontSize: 7, color: C.secondary },

  // Section boxes
  twoCol:  { flexDirection: 'row', marginBottom: 10 },
  boxLeft: { flex: 1, borderWidth: 1, borderColor: C.border, padding: 8, marginRight: 8 },
  box:     { flex: 1, borderWidth: 1, borderColor: C.border, padding: 8 },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.label,
    letterSpacing: 1.2,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    paddingBottom: 4,
    marginBottom: 6,
  },
  boldName:  { fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  sub:       { fontSize: 7.5, color: C.secondary, marginTop: 2 },
  fieldRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  fieldLbl:  { fontSize: 8, color: C.secondary },
  fieldVal:  { fontSize: 8, fontFamily: 'Helvetica-Bold' },

  // Table
  table:    { borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  tHead:    { flexDirection: 'row', backgroundColor: C.bgTableHead, borderBottomWidth: 1, borderBottomColor: C.border },
  tRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.borderLight },
  tRowLast: { flexDirection: 'row' },
  th:       { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.label, paddingVertical: 5, paddingHorizontal: 4 },
  td:       { fontSize: 7.5, color: C.text,      paddingVertical: 4, paddingHorizontal: 4 },
  tdBold:   { fontSize: 7.5, fontFamily: 'Helvetica-Bold', paddingVertical: 4, paddingHorizontal: 4 },
  tdMuted:  { fontSize: 7.5, color: C.secondary, paddingVertical: 4, paddingHorizontal: 4 },
  cNum:   { width: '4%' },
  cDesc:  { width: '28%' },
  cCode:  { width: '12%', textAlign: 'right' as const },
  cHsn:   { width: '9%',  textAlign: 'right' as const },
  cQty:   { width: '9%',  textAlign: 'right' as const },
  cUnit:  { width: '8%',  textAlign: 'right' as const },
  cRate:  { width: '13%', textAlign: 'right' as const },
  cAmt:   { width: '13%', textAlign: 'right' as const },

  // Summary
  sumOuter:  { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  sumBox:    { width: '38%', borderWidth: 1, borderColor: C.border, padding: 8 },
  sumRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sumLbl:    { fontSize: 8, color: C.secondary },
  sumVal:    { fontSize: 8 },
  sumDisc:   { fontSize: 8, color: C.red },
  sumDiv:    { borderTopWidth: 1, borderTopColor: C.border, marginVertical: 4 },
  sumTotLbl: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.label },
  sumTotVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.green },

  // Amount in words
  words:    { borderWidth: 1, borderColor: C.border, padding: 8, marginBottom: 10, flexDirection: 'row', flexWrap: 'wrap' },
  wordsLbl: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  wordsVal: { fontSize: 8, color: C.secondary },

  // Signatory
  sigOuter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, marginBottom: 10 },
  sigBox:   { width: 140, borderWidth: 1, borderColor: C.border, padding: 10, alignItems: 'center' },
  sigTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.label, letterSpacing: 1 },
  sigLine:  { height: 1, width: 100, backgroundColor: C.border, marginTop: 22, marginBottom: 22 },
  sigName:  { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  sigFor:   { fontSize: 7, color: C.secondary, marginTop: 2 },

  // Footer
  footer:    { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6, marginTop: 4 },
  footerTxt: { fontSize: 7, color: C.muted },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function DeliveryChallanPDF({ challan }: { challan: DeliveryChallan }) {
  const companyName = challan.companyName || 'Company Name';
  const total = challan.grandTotal || 0;
  const items = challan.lineItems?.length
    ? challan.lineItems
    : [{ itemCode: '-', description: '-', hsn: '-', quantity: 0, unit: '-', rate: 0, amount: 0 }];

  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const deliveryTypeLabel = DELIVERY_TYPE_LABEL[challan.deliveryType ?? ''] || challan.deliveryType || 'Supply of Goods';

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{companyName}</Text>
            <Text style={s.gstin}>GSTIN: {challan.gstin || 'N/A'}</Text>
            {challan.state ? <Text style={s.gstin}>State: {challan.state}</Text> : null}
          </View>
          <View style={s.logoBox}>
            <Text style={s.logoText}>No Logo</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <View style={s.titleBar}>
          <Text style={s.titleText}>DELIVERY CHALLAN</Text>
          <View style={s.badgeRow}>
            <View style={s.badge}>
              <Text style={s.badgeText}>{(challan.status || 'draft').toUpperCase()}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>{deliveryTypeLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── From / Deliver To + Challan Details ── */}
        <View style={s.twoCol}>
          <View style={s.boxLeft}>
            <Text style={s.sectionTitle}>FROM</Text>
            <Text style={s.boldName}>{companyName}</Text>
            <Text style={s.sub}>GSTIN: {challan.gstin || 'N/A'}</Text>
            {challan.state ? <Text style={s.sub}>State: {challan.state}</Text> : null}
          </View>
          <View style={s.box}>
            <Text style={s.sectionTitle}>DELIVER TO</Text>
            <Text style={s.boldName}>{challan.customerName || 'N/A'}</Text>
            <Text style={s.sub}>GSTIN: {challan.customerGstin || 'N/A'}</Text>
            {challan.buyerAddress ? <Text style={s.sub}>{challan.buyerAddress}</Text> : null}
            {challan.placeOfSupply ? <Text style={s.sub}>Place of Supply: {challan.placeOfSupply}</Text> : null}
          </View>
        </View>

        <View style={s.twoCol}>
          <View style={s.boxLeft}>
            <Text style={s.sectionTitle}>CHALLAN DETAILS</Text>
            <View style={s.fieldRow}>
              <Text style={s.fieldLbl}>Challan No:</Text>
              <Text style={s.fieldVal}>{challan.challanNumber || 'N/A'}</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLbl}>Challan Date:</Text>
              <Text style={s.fieldLbl}>{fmtDate(challan.challanDate)}</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLbl}>Delivery Date:</Text>
              <Text style={s.fieldLbl}>{fmtDate(challan.deliveryDate)}</Text>
            </View>
          </View>
          <View style={s.box}>
            <Text style={s.sectionTitle}>OTHER DETAILS</Text>
            {challan.reference ? (
              <View style={s.fieldRow}>
                <Text style={s.fieldLbl}>Reference:</Text>
                <Text style={s.fieldLbl}>{challan.reference}</Text>
              </View>
            ) : null}
            <View style={s.fieldRow}>
              <Text style={s.fieldLbl}>Delivery Type:</Text>
              <Text style={s.fieldLbl}>{deliveryTypeLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── Line Items Table ── */}
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cDesc]}>Description</Text>
            <Text style={[s.th, s.cCode]}>Item Code</Text>
            <Text style={[s.th, s.cHsn]}>HSN</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cUnit]}>Unit</Text>
            <Text style={[s.th, s.cRate]}>Rate</Text>
            <Text style={[s.th, s.cAmt]}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id ?? i} style={i === items.length - 1 ? s.tRowLast : s.tRow}>
              <Text style={[s.tdMuted, s.cNum]}>{i + 1}</Text>
              <Text style={[s.tdBold,  s.cDesc]}>{item.description || '-'}</Text>
              <Text style={[s.tdMuted, s.cCode]}>{item.itemCode || '-'}</Text>
              <Text style={[s.tdMuted, s.cHsn]}>{item.hsn || '-'}</Text>
              <Text style={[s.td,      s.cQty]}>{(item.quantity ?? 0).toFixed(2)}</Text>
              <Text style={[s.tdMuted, s.cUnit]}>{item.unit || '-'}</Text>
              <Text style={[s.td,      s.cRate]}>{fmt(item.rate ?? 0)}</Text>
              <Text style={[s.tdBold,  s.cAmt]}>{fmt(item.amount ?? 0)}</Text>
            </View>
          ))}
        </View>

        {/* ── Summary ── */}
        <View style={s.sumOuter}>
          <View style={s.sumBox}>
            <Text style={s.sectionTitle}>SUMMARY</Text>
            <View style={s.sumRow}>
              <Text style={s.sumLbl}>Total Qty:</Text>
              <Text style={s.sumVal}>{totalQty.toFixed(2)}</Text>
            </View>
            <View style={s.sumRow}>
              <Text style={s.sumLbl}>Subtotal:</Text>
              <Text style={s.sumVal}>{fmt(challan.subtotal || 0)}</Text>
            </View>
            {(challan.discount ?? 0) > 0 && (
              <View style={s.sumRow}>
                <Text style={s.sumLbl}>Discount:</Text>
                <Text style={s.sumDisc}>- {fmt(challan.discount || 0)}</Text>
              </View>
            )}
            {(challan.taxableAmount ?? 0) > 0 && (
              <View style={s.sumRow}>
                <Text style={s.sumLbl}>Taxable Amount:</Text>
                <Text style={s.sumVal}>{fmt(challan.taxableAmount || 0)}</Text>
              </View>
            )}
            {(challan.totalTax ?? 0) > 0 && (
              <View style={s.sumRow}>
                <Text style={s.sumLbl}>Total Tax:</Text>
                <Text style={s.sumVal}>{fmt(challan.totalTax || 0)}</Text>
              </View>
            )}
            <View style={s.sumDiv} />
            <View style={s.sumRow}>
              <Text style={s.sumTotLbl}>Grand Total:</Text>
              <Text style={s.sumTotVal}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Amount in Words ── */}
        <View style={s.words}>
          <Text style={s.wordsLbl}>Amount in Words:{'  '}</Text>
          <Text style={s.wordsVal}>{amountToWords(total)}</Text>
        </View>

        {/* ── Notes ── */}
        {challan.notes ? (
          <View style={[s.box, { marginBottom: 10 }]}>
            <Text style={s.sectionTitle}>NOTES</Text>
            <Text style={[s.sub, { fontStyle: 'italic' }]}>{challan.notes}</Text>
          </View>
        ) : null}

        {/* ── Authorized Signatory ── */}
        <View style={s.sigOuter}>
          <View style={s.sigBox}>
            <Text style={s.sigTitle}>AUTHORIZED SIGNATORY</Text>
            <View style={s.sigLine} />
            <Text style={s.sigName}>Authorized Signatory</Text>
            <Text style={s.sigFor}>For {companyName}</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>This is a computer-generated delivery challan.</Text>
          <Text style={s.footerTxt}>Page 1 of 1</Text>
        </View>

      </Page>
    </Document>
  );
}
