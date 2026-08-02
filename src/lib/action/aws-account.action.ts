'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/api-error';
import { AwsAccountApi } from '@/lib/api/aws-account.api';
import {
  type CreateAwsAccountInput,
  createAwsAccountSchema,
} from '@/lib/schema/create-aws-account.schema';
import {
  VerifyAwsAccountInput,
  verifyAwsAccountSchema,
} from '@/lib/schema/verify-aws-account.schema';

export async function createAwsAccountAction(input: CreateAwsAccountInput) {
  const parsed = createAwsAccountSchema.safeParse(input);

  if (!parsed.success) {
    console.log('validation error:', parsed.error.flatten());
    return {
      success: false as const,
      message: 'Please check the AWS account details.',
    };
  }

  const data = parsed.data;

  const payload = {
    accountName: data.accountName,
    awsAccountId: data.awsAccountId,
    ownerDepartment: data.ownerDepartment,
    defaultRegion: data.defaultRegion,
    roleArn: data.roleArn || undefined,
    isActive: data.isActive,
  };

  try {
    await AwsAccountApi.createAwsAccount(payload);

    revalidatePath('/aws-accounts');

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        code: error.code,
        message: error.message,
      };
    }

    throw error;
  }
}

export async function verifyAwsAccountAction(input: VerifyAwsAccountInput) {
  const parsed = verifyAwsAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: 'Please check the verification details.',
    };
  }

  const { awsAccountId, roleArn } = parsed.data;

  try {
    // 1. บันทึก Role ARN ก่อน
    await AwsAccountApi.updateAwsAccount(awsAccountId, {
      roleArn,
    });

    // 2. Verify ด้วย Role ARN ที่บันทึกแล้ว
    const result = await AwsAccountApi.verifyAwsAccount(awsAccountId);

    revalidatePath('/aws-accounts');

    return {
      success: true as const,
      message: result.message,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false as const,
        message: error.message,
        status: error.status,
      };
    }

    throw error;
  }
}
