import { z } from 'zod';
export declare const domesticProformaItemSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    itemCode: z.ZodString;
    description: z.ZodString;
    hsn: z.ZodString;
    qty: z.ZodNumber;
    rate: z.ZodNumber;
    amount: z.ZodNumber;
    gstPercent: z.ZodNumber;
    total: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const createDomesticProformaSchema: z.ZodObject<
  {
    proformaNumber: z.ZodString;
    date: z.ZodCoercedDate<unknown>;
    validUntil: z.ZodCoercedDate<unknown>;
    exchangeRate: z.ZodNumber;
    isRateLocked: z.ZodDefault<z.ZodBoolean>;
    sellerCompanyName: z.ZodString;
    sellerGstin: z.ZodString;
    sellerState: z.ZodString;
    customerName: z.ZodString;
    customerGstin: z.ZodString;
    placeOfSupply: z.ZodString;
    discountValue: z.ZodDefault<z.ZodNumber>;
    discountType: z.ZodDefault<
      z.ZodEnum<{
        '\u20B9': '₹';
        '%': '%';
      }>
    >;
    subtotal: z.ZodNumber;
    discountAmount: z.ZodDefault<z.ZodNumber>;
    taxableAmount: z.ZodNumber;
    igst: z.ZodDefault<z.ZodNumber>;
    totalTax: z.ZodNumber;
    grandTotal: z.ZodNumber;
    paymentTerms: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    reference: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodString>;
    lineItems: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodOptional<z.ZodString>;
          itemCode: z.ZodString;
          description: z.ZodString;
          hsn: z.ZodString;
          qty: z.ZodNumber;
          rate: z.ZodNumber;
          amount: z.ZodNumber;
          gstPercent: z.ZodNumber;
          total: z.ZodNumber;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const updateDomesticProformaSchema: z.ZodObject<
  {
    proformaNumber: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    validUntil: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    exchangeRate: z.ZodOptional<z.ZodNumber>;
    isRateLocked: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    sellerCompanyName: z.ZodOptional<z.ZodString>;
    sellerGstin: z.ZodOptional<z.ZodString>;
    sellerState: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    customerGstin: z.ZodOptional<z.ZodString>;
    placeOfSupply: z.ZodOptional<z.ZodString>;
    discountValue: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    discountType: z.ZodOptional<
      z.ZodDefault<
        z.ZodEnum<{
          '\u20B9': '₹';
          '%': '%';
        }>
      >
    >;
    subtotal: z.ZodOptional<z.ZodNumber>;
    discountAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    taxableAmount: z.ZodOptional<z.ZodNumber>;
    igst: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    totalTax: z.ZodOptional<z.ZodNumber>;
    grandTotal: z.ZodOptional<z.ZodNumber>;
    paymentTerms: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    reference: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    lineItems: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodOptional<z.ZodString>;
            itemCode: z.ZodString;
            description: z.ZodString;
            hsn: z.ZodString;
            qty: z.ZodNumber;
            rate: z.ZodNumber;
            amount: z.ZodNumber;
            gstPercent: z.ZodNumber;
            total: z.ZodNumber;
          },
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
export type CreateDomesticProformaDto = z.infer<typeof createDomesticProformaSchema>;
export type UpdateDomesticProformaDto = z.infer<typeof updateDomesticProformaSchema>;
