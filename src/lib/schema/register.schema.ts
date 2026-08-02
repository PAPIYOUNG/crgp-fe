import { z } from 'zod';

export const DEPARTMENT_OPTIONS = [
  'IT',
  'ENGINEERING',
  'FINANCE',
  'HUMAN_RESOURCES',
  'SALES',
  'MARKETING',
  'OPERATIONS',
  'SECURITY',
  'OTHER',
] as const;

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Invalid email address'),
    password: z
      .string('Password must be a string')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string('Password must be a string')
      .min(1, 'Confirm your password'),
    department: z.enum(DEPARTMENT_OPTIONS, {
      error: 'Department is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type RegisterRequest = Omit<RegisterInput, 'confirmPassword'>;
