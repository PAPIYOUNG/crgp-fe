import { z } from 'zod';

export const departmentSchema = z.enum([
  'IT',
  'ENGINEERING',
  'FINANCE',
  'HUMAN_RESOURCES',
  'SALES',
  'MARKETING',
  'OPERATIONS',
  'SECURITY',
  'OTHER',
]);

export const editProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),

  department: departmentSchema,
});

export type Department = z.infer<typeof departmentSchema>;

export type EditProfileInput = z.infer<typeof editProfileSchema>;
