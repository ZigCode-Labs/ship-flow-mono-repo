import { z } from 'zod';
declare const normalizedRegisterSchema: z.ZodObject<
  {
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
  },
  z.core.$strip
>;
declare const normalizedLoginSchema: z.ZodObject<
  {
    email: z.ZodString;
    password: z.ZodString;
  },
  z.core.$strip
>;
export declare const registerSchema: z.ZodPreprocess<
  z.ZodObject<
    {
      firstName: z.ZodString;
      lastName: z.ZodString;
      email: z.ZodString;
      password: z.ZodString;
    },
    z.core.$strip
  >
>;
export declare const loginSchema: z.ZodPreprocess<
  z.ZodObject<
    {
      email: z.ZodString;
      password: z.ZodString;
    },
    z.core.$strip
  >
>;
export type RegisterDto = z.infer<typeof normalizedRegisterSchema>;
export type LoginDto = z.infer<typeof normalizedLoginSchema>;
export {};
