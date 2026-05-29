import { z } from 'zod';
export declare const domesticBuyerIdSchema: z.ZodString;
export declare const domesticBuyerStatusSchema: z.ZodEnum<{
  active: 'active';
  inactive: 'inactive';
  trash: 'trash';
}>;
export declare const createDomesticBuyerSchema: z.ZodObject<
  {
    companyName: z.ZodString;
    tradeName: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    gstin: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    panNumber: z.ZodPipe<
      z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>,
      z.ZodTransform<string | null | undefined, string | null | undefined>
    >;
    address: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    city: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    state: z.ZodString;
    pincode: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    contactPerson: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    designation: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    email: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    phone: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    alternatePhone: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    bankName: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    accountNumber: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    ifscCode: z.ZodPipe<
      z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>,
      z.ZodTransform<string | null | undefined, string | null | undefined>
    >;
    branch: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    status: z.ZodDefault<
      z.ZodEnum<{
        active: 'active';
        inactive: 'inactive';
        trash: 'trash';
      }>
    >;
  },
  z.core.$strip
>;
export declare const updateDomesticBuyerSchema: z.ZodObject<
  {
    companyName: z.ZodOptional<z.ZodString>;
    tradeName: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    gstin: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    panNumber: z.ZodOptional<
      z.ZodPipe<
        z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>,
        z.ZodTransform<string | null | undefined, string | null | undefined>
      >
    >;
    address: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    city: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    contactPerson: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    designation: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    email: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    phone: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    alternatePhone: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    bankName: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    accountNumber: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    ifscCode: z.ZodOptional<
      z.ZodPipe<
        z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>,
        z.ZodTransform<string | null | undefined, string | null | undefined>
      >
    >;
    branch: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    notes: z.ZodOptional<z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    status: z.ZodOptional<
      z.ZodDefault<
        z.ZodEnum<{
          active: 'active';
          inactive: 'inactive';
          trash: 'trash';
        }>
      >
    >;
  },
  z.core.$strip
>;
export type CreateDomesticBuyerDto = z.infer<typeof createDomesticBuyerSchema>;
export type UpdateDomesticBuyerDto = z.infer<typeof updateDomesticBuyerSchema>;
