'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/api-error';
import { cloudResourceApi } from '@/lib/api/project-cloudresource.api';

export async function getAvailableResourcesAction(awsAccountId: string) {
  if (!awsAccountId) {
    return {
      success: false as const,
      message: 'AWS account ID is required.',
      items: [],
    };
  }

  try {
    const items =
      await cloudResourceApi.getCloudResourcesByAwsAccount(awsAccountId);

    return {
      success: true as const,
      items,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false as const,
        message: error.message,
        items: [],
      };
    }

    throw error;
  }
}

export async function addResourceToProjectAction(
  projectId: string,
  resourceId: string,
) {
  if (!projectId) {
    return {
      success: false as const,
      message: 'Project ID is required.',
    };
  }

  if (!resourceId) {
    return {
      success: false as const,
      message: 'Please select a cloud resource.',
    };
  }

  try {
    await cloudResourceApi.editCloudResource(resourceId, {
      projectId,
    });
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

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/cloud-resources');

  return {
    success: true as const,
  };
}

export async function removeResourceFromProjectAction(
  projectId: string,
  resourceId: string,
) {
  try {
    await cloudResourceApi.removeResourceFromProject(resourceId);

    revalidatePath(`/project/${projectId}`);

    return {
      success: true as const,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false as const,
        message: error.message,
      };
    }

    throw error;
  }
}
