export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  creditNoteDate: string;
  customerName: string;
  customerGstin: string;
  placeOfSupply: string;
  reason: string;
  amount: number;
  status: 'draft' | 'sent' | 'applied' | 'voided';
  lineItems: Array<{
    id: string;
    itemCode: string;
    description: string;
    hsn: string;
    quantity: number;
    rate: number;
    amount: number;
    gst: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  totalTax: number;
  grandTotal: number;
}
