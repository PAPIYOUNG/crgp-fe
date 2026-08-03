'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/api-error';
import { awsSyncApi } from '@/lib/api/aws-sync.api';

export async function syncAllAwsAction(awsAccountId: string) {
  if (!awsAccountId) {
    return {
      success: false as const,
      message: 'AWS account ID is required.',
    };
  }

  try {
    const data = await awsSyncApi.syncAll(awsAccountId);

    revalidatePath('/aws-accounts');
    revalidatePath('/cloud-resources');
    revalidatePath('/project');

    return {
      success: true as const,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false as const,
        status: error.status,
        code: error.code,
        message: error.message,
      };
    }

    throw error;
  }
}
