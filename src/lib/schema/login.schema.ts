import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string('Password must be a string')
    .min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
