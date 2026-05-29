import { z } from 'zod';
export declare const deliveryChallanItemSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    itemCode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    description: z.ZodString;
    hsn: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    quantity: z.ZodNumber;
    unit: z.ZodDefault<z.ZodString>;
    rate: z.ZodNumber;
    amount: z.ZodNumber;
    gst: z.ZodDefault<z.ZodNumber>;
    total: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const createDeliveryChallanSchema: z.ZodObject<
  {
    challanNumber: z.ZodString;
    challanDate: z.ZodCoercedDate<unknown>;
    deliveryDate: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    deliveryType: z.ZodDefault<z.ZodString>;
    companyName: z.ZodString;
    gstin: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    state: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    customerId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    customerName: z.ZodString;
    customerGstin: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    buyerAddress: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    buyerState: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    placeOfSupply: z.ZodString;
    transporterName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    vehicleNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    expectedDeliveryDate: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    linkedInvoiceId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    reference: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    exchangeRate: z.ZodDefault<z.ZodNumber>;
    subtotal: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
    taxableAmount: z.ZodNumber;
    totalTax: z.ZodDefault<z.ZodNumber>;
    grandTotal: z.ZodNumber;
    status: z.ZodDefault<z.ZodString>;
    lineItems: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodOptional<z.ZodString>;
          itemCode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
          description: z.ZodString;
          hsn: z.ZodDefault<z.ZodOptional<z.ZodString>>;
          quantity: z.ZodNumber;
          unit: z.ZodDefault<z.ZodString>;
          rate: z.ZodNumber;
          amount: z.ZodNumber;
          gst: z.ZodDefault<z.ZodNumber>;
          total: z.ZodNumber;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const updateDeliveryChallanSchema: z.ZodObject<
  {
    challanNumber: z.ZodOptional<z.ZodString>;
    challanDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    deliveryDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>>;
    deliveryType: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    companyName: z.ZodOptional<z.ZodString>;
    gstin: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    state: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    customerId: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    customerName: z.ZodOptional<z.ZodString>;
    customerGstin: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    buyerAddress: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    buyerState: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    placeOfSupply: z.ZodOptional<z.ZodString>;
    transporterName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    vehicleNumber: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    expectedDeliveryDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>>;
    linkedInvoiceId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    reference: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    exchangeRate: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    subtotal: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    taxableAmount: z.ZodOptional<z.ZodNumber>;
    totalTax: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    grandTotal: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    lineItems: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodOptional<z.ZodString>;
            itemCode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            description: z.ZodString;
            hsn: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            quantity: z.ZodNumber;
            unit: z.ZodDefault<z.ZodString>;
            rate: z.ZodNumber;
            amount: z.ZodNumber;
            gst: z.ZodDefault<z.ZodNumber>;
            total: z.ZodNumber;
          },
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
export type CreateDeliveryChallanDto = z.infer<typeof createDeliveryChallanSchema>;
export type UpdateDeliveryChallanDto = z.infer<typeof updateDeliveryChallanSchema>;
