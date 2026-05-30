import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Password must be at least 12 characters'),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verify2faSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits').regex(/^\d+$/, 'Token must be numeric'),
});

export const disable2faSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits').regex(/^\d+$/, 'Token must be numeric'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ChangeEmailDto = z.infer<typeof changeEmailSchema>;
export type Verify2faDto = z.infer<typeof verify2faSchema>;
export type Disable2faDto = z.infer<typeof disable2faSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
