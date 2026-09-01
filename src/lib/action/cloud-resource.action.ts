'use server';

import { revalidatePath } from 'next/cache';

import { CloudResourceInput } from '@/components/feature/cloud-resource/CloudResourceForm';
import { ApiError } from '@/lib/api/api-error';
import { CreateCloudResourceRequest } from '@/lib/api/api-type';
import { cloudResourceApi } from '@/lib/api/project-cloudresource.api';

// ฟอร์มยังใช้ค่า Environment แบบเดิม (PRODUCTION) แต่ backend อ้างอิง Prisma enum (PROD)
const ENVIRONMENT_TO_BACKEND: Record<
  string,
  CreateCloudResourceRequest['environment']
> = {
  DEV: 'DEV',
  UAT: 'UAT',
  STAGING: 'STAGING',
  PRODUCTION: 'PROD',
};

export async function CreateResourceManual(input: CloudResourceInput) {
  try {
    const payload: CreateCloudResourceRequest = {
      provider: input.provider as CreateCloudResourceRequest['provider'],
      // AWS Account มีความหมายเฉพาะตอน provider เป็น AWS เท่านั้น
      awsAccountId:
        input.provider === 'AWS' ? input.awsAccountId : undefined,
      resourceName: input.resourceName.trim(),
      service: input.service as CreateCloudResourceRequest['service'],
      instanceType: input.instanceType?.trim() || undefined,
      region: input.region,
      projectId: input.projectId || undefined,
      environment: input.environment
        ? ENVIRONMENT_TO_BACKEND[input.environment]
        : undefined,
      status: input.status || undefined,
      monthlyCost: input.monthlyCost || undefined,
      description: input.description?.trim() || undefined,
    };

    await cloudResourceApi.createCloudResource(payload);

    revalidatePath('/cloud-resources');

    return {
      success: true as const,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false as const,
        status: error.status,
        message: error.message,
      };
    }

    throw error;
  }
}
