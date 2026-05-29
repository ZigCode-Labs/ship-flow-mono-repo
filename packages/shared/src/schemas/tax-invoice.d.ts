import { z } from 'zod';
export declare const taxInvoiceLineItemSchema: z.ZodObject<
  {
    itemCode: z.ZodString;
    description: z.ZodString;
    hsn: z.ZodDefault<z.ZodString>;
    quantity: z.ZodNumber;
    rate: z.ZodNumber;
    amount: z.ZodNumber;
    gst: z.ZodNumber;
    total: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const createTaxInvoiceSchema: z.ZodObject<
  {
    invoiceNumber: z.ZodOptional<z.ZodString>;
    invoiceDate: z.ZodCoercedDate<unknown>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    exchangeRate: z.ZodDefault<z.ZodNumber>;
    companyName: z.ZodString;
    gstin: z.ZodString;
    state: z.ZodString;
    customerId: z.ZodString;
    customerName: z.ZodString;
    customerGstin: z.ZodString;
    placeOfSupply: z.ZodString;
    bankName: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    accountNumber: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    ifscCode: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    branch: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    paymentTerms: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    reference: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    subtotal: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
    taxableAmount: z.ZodNumber;
    igst: z.ZodDefault<z.ZodNumber>;
    totalTax: z.ZodNumber;
    grandTotal: z.ZodNumber;
    status: z.ZodDefault<
      z.ZodEnum<{
        draft: 'draft';
        sent: 'sent';
        paid: 'paid';
        overdue: 'overdue';
        cancelled: 'cancelled';
      }>
    >;
    lineItems: z.ZodArray<
      z.ZodObject<
        {
          itemCode: z.ZodString;
          description: z.ZodString;
          hsn: z.ZodDefault<z.ZodString>;
          quantity: z.ZodNumber;
          rate: z.ZodNumber;
          amount: z.ZodNumber;
          gst: z.ZodNumber;
          total: z.ZodNumber;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const updateTaxInvoiceSchema: z.ZodObject<
  {
    invoiceNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    invoiceDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>>;
    exchangeRate: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    companyName: z.ZodOptional<z.ZodString>;
    gstin: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    customerGstin: z.ZodOptional<z.ZodString>;
    placeOfSupply: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    accountNumber: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    ifscCode: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    branch: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    paymentTerms: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    reference: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    notes: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    subtotal: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    taxableAmount: z.ZodOptional<z.ZodNumber>;
    igst: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    totalTax: z.ZodOptional<z.ZodNumber>;
    grandTotal: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<
      z.ZodDefault<
        z.ZodEnum<{
          draft: 'draft';
          sent: 'sent';
          paid: 'paid';
          overdue: 'overdue';
          cancelled: 'cancelled';
        }>
      >
    >;
    lineItems: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            itemCode: z.ZodString;
            description: z.ZodString;
            hsn: z.ZodDefault<z.ZodString>;
            quantity: z.ZodNumber;
            rate: z.ZodNumber;
            amount: z.ZodNumber;
            gst: z.ZodNumber;
            total: z.ZodNumber;
          },
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
export declare const updateTaxInvoiceLineItemSchema: z.ZodObject<
  {
    itemCode: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    hsn: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    quantity: z.ZodOptional<z.ZodNumber>;
    rate: z.ZodOptional<z.ZodNumber>;
    amount: z.ZodOptional<z.ZodNumber>;
    gst: z.ZodOptional<z.ZodNumber>;
    total: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
export declare const filterTaxInvoiceSchema: z.ZodObject<
  {
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodDefault<
      z.ZodEnum<{
        status: 'status';
        customerName: 'customerName';
        grandTotal: 'grandTotal';
        invoiceNumber: 'invoiceNumber';
        invoiceDate: 'invoiceDate';
        createdAt: 'createdAt';
      }>
    >;
    sortOrder: z.ZodDefault<
      z.ZodEnum<{
        asc: 'asc';
        desc: 'desc';
      }>
    >;
    status: z.ZodOptional<
      z.ZodEnum<{
        draft: 'draft';
        sent: 'sent';
        paid: 'paid';
        overdue: 'overdue';
        cancelled: 'cancelled';
      }>
    >;
    dateFrom: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    dateTo: z.ZodOptional<z.ZodCoercedDate<unknown>>;
  },
  z.core.$strip
>;
export type CreateTaxInvoiceDto = z.infer<typeof createTaxInvoiceSchema>;
export type UpdateTaxInvoiceDto = z.infer<typeof updateTaxInvoiceSchema>;
export type FilterTaxInvoiceDto = z.infer<typeof filterTaxInvoiceSchema>;
