'use server';

import { ErrorActionResult } from '@/lib/action/action.type';
import { AuthApi } from '@/lib/api/auth.api';
import { signIn, signOut } from '@/lib/auth';
import { LoginInput } from '@/lib/schema/login.schema';
import { RegisterInput, RegisterSchema } from '@/lib/schema/register.schema';
import { AuthError } from 'next-auth';
import { ApiError } from '@/lib/api/api-error';
import { redirect } from 'next/navigation';
import z from 'zod';

export async function loginAction(
  input: LoginInput,
): Promise<ErrorActionResult | void> {
  try {
    await signIn('credentials', {
      ...input,
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return {
          success: false,
          message: 'Email or password is invalid',
          code: 'INVALID_CREDENTIALS',
        };
      }

      return {
        success: false,
        message: 'Unable to sign in. Please try again.',
        code: 'AUTH_ERROR',
      };
    }

    throw error;
  }
}

export async function registerAction(
  input: RegisterInput,
): Promise<ErrorActionResult | void> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'validation failed',
      errors: z.flattenError(parsed.error).fieldErrors,
      code: 'VALIDATION_ERROR',
    };
  }
  const { confirmPassword, ...registerData } = parsed.data;
  try {
    await AuthApi.register(registerData);
    redirect('/login');
  } catch (error) {
    console.log('error', error);
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return {
          success: false,
          message: 'Email already in use',
          code: 'EMAIL_ALREADY_EXISTS',
        };
      }

      return {
        success: false,
        message: 'Unable to create account. Please try again.',
        code: 'REGISTER_FAILED',
      };
    }

    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}
