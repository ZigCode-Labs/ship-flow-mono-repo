import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { CreditNoteData } from './credit-note-email.schema';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoBox: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 8,
    color: '#999',
  },
  companyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  titleBar: {
    backgroundColor: '#fef3c7',
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    letterSpacing: 1,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  columnBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  boxHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boxLabel: {
    fontSize: 8,
    color: '#555',
    marginBottom: 2,
  },
  boxValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  detailLabel: {
    fontSize: 8,
    color: '#555',
  },
  detailValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2563a8',
  },
  reasonBox: {
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    padding: 8,
    marginBottom: 10,
  },
  reasonLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  reasonValue: {
    fontSize: 9,
    color: '#333',
  },
  table: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 8,
    color: '#333',
  },
  summaryBox: {
    width: 200,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    marginBottom: 10,
  },
  summaryHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 8,
    color: '#555',
  },
  summaryValue: {
    fontSize: 9,
    color: '#333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  grandTotalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  amountInWordsBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    marginBottom: 10,
  },
  amountInWordsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  amountInWordsValue: {
    fontSize: 9,
    color: '#c0392b',
    fontWeight: 'bold',
  },
  signatoryBox: {
    width: 220,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#1e3a5f',
    marginBottom: 10,
  },
  signatoryHeader: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 4,
    alignItems: 'center',
  },
  signatoryHeaderText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  signatoryBody: {
    padding: 8,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatoryName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  footerCountry: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 4,
  },
  footerCountryText: {
    fontSize: 8,
    color: '#666',
  },
});

function numberToWords(num: number): string {
  if (num === 0) return 'Rupees Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  function convertTwoDigit(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
  }

  function convertThreeDigit(n: number): string {
    if (n < 100) return convertTwoDigit(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertTwoDigit(n % 100) : '');
  }

  let integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  if (integerPart === 0) {
    return 'Rupees Zero' + (decimalPart > 0 ? ' and ' + convertTwoDigit(decimalPart) + ' Paise' : '') + ' Only';
  }

  const parts: string[] = [];
  let scaleIndex = 0;

  while (integerPart > 0) {
    let chunk: number;
    if (scaleIndex === 0) {
      chunk = integerPart % 1000;
      integerPart = Math.floor(integerPart / 1000);
    } else {
      chunk = integerPart % 100;
      integerPart = Math.floor(integerPart / 100);
    }

    if (chunk > 0) {
      const chunkStr = scaleIndex === 0 ? convertThreeDigit(chunk) : convertTwoDigit(chunk);
      parts.unshift(chunkStr + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : ''));
    }
    scaleIndex++;
  }

  let result = 'Rupees ' + parts.join(' ');
  if (decimalPart > 0) {
    result += ' and ' + convertTwoDigit(decimalPart) + ' Paise';
  }
  result += ' Only';

  return result;
}

const CreditNoteDocument: React.FC<{ creditNote: CreditNoteData }> = ({ creditNote }) => {
  const formatDate = (d: string) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (n: number) =>
    `Rs.${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>Logo</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Credit Note</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>CREDIT NOTE</Text>
        </View>

        {/* Bill To & Note Details */}
        <View style={styles.twoColumn}>
          <View style={styles.columnBox}>
            <Text style={styles.boxHeader}>Issued To</Text>
            <Text style={styles.boxValue}>{creditNote.customerName || 'N/A'}</Text>
            {creditNote.customerGstin && (
              <Text style={styles.boxLabel}>GSTIN: {creditNote.customerGstin}</Text>
            )}
            {creditNote.placeOfSupply && (
              <Text style={styles.boxLabel}>Place of Supply: {creditNote.placeOfSupply}</Text>
            )}
          </View>
          <View style={styles.columnBox}>
            <Text style={styles.boxHeader}>Credit Note Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Credit Note No:</Text>
              <Text style={styles.detailValue}>{creditNote.creditNoteNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(creditNote.creditNoteDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Against Invoice:</Text>
              <Text style={styles.detailValue}>{creditNote.invoiceNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice Date:</Text>
              <Text style={styles.detailValue}>{formatDate(creditNote.invoiceDate)}</Text>
            </View>
          </View>
        </View>

        {/* Reason */}
        {creditNote.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Reason for Credit Note:</Text>
            <Text style={styles.reasonValue}>{creditNote.reason}</Text>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '5%' }]}>#</Text>
            <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Item Code</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%' }]}>HSN</Text>
            <Text style={[styles.tableHeaderCell, { width: '8%', textAlign: 'right' }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, { width: '8%', textAlign: 'right' }]}>GST %</Text>
            <Text style={[styles.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>Total</Text>
          </View>
          {creditNote.lineItems.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, { width: '5%' }]}>{index + 1}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{item.itemCode || '-'}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{item.hsn || '-'}</Text>
              <Text style={[styles.tableCell, { width: '8%', textAlign: 'right' }]}>{item.quantity} PCS</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>{formatCurrency(item.rate)}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>{formatCurrency(item.amount)}</Text>
              <Text style={[styles.tableCell, { width: '8%', textAlign: 'right' }]}>{item.gst}%</Text>
              <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryHeader}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(creditNote.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxable Amount:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(creditNote.taxableAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Tax:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(creditNote.totalTax)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Credit Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(creditNote.grandTotal)}</Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountInWordsBox}>
          <Text style={styles.amountInWordsLabel}>Credit Amount in Words:</Text>
          <Text style={styles.amountInWordsValue}>{numberToWords(creditNote.grandTotal)}</Text>
        </View>

        {/* Authorized Signatory */}
        <View style={styles.signatoryBox}>
          <View style={styles.signatoryHeader}>
            <Text style={styles.signatoryHeaderText}>Authorized Signatory</Text>
          </View>
          <View style={styles.signatoryBody}>
            <Text style={styles.signatoryName}>Authorized Signatory</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerCountry}>
          <Text style={styles.footerCountryText}>India</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateCreditNotePdf(creditNote: CreditNoteData): Promise<Buffer> {
  const buffer = await renderToBuffer(<CreditNoteDocument creditNote={creditNote} />);
  return Buffer.from(buffer);
}

export function buildCreditNoteEmailHtml(creditNote: CreditNoteData, recipientName: string): string {
  const formatCurrency = (n: number) =>
    `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; }
    p { margin: 0 0 12px 0; }
    ul { margin: 0 0 12px 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
    .signature { margin-top: 16px; }
  </style>
</head>
<body>
  <p>Dear ${recipientName || ''},</p>
  <p>Please find attached Credit Note ${creditNote.creditNoteNumber} issued against Invoice ${creditNote.invoiceNumber}.</p>
  <p><strong>Credit Note Details:</strong></p>
  <ul>
    <li>Credit Note Number: ${creditNote.creditNoteNumber}</li>
    <li>Against Invoice: ${creditNote.invoiceNumber}</li>
    <li>Credit Amount: ${formatCurrency(creditNote.grandTotal)}</li>
    ${creditNote.reason ? `<li>Reason: ${creditNote.reason}</li>` : ''}
  </ul>
  <p>This credit note will be adjusted against your outstanding balance.</p>
  <div class="signature">
    <p>Best regards,</p>
    <p>ShipFlow</p>
  </div>
</body>
</html>
  `.trim();
}
