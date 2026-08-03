'use server';
import { ApiError } from '@/lib/api/api-error';
import { ProjectAwsAccountApi } from '@/lib/api/project-awsaccount.api';
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate';

export type AddAwsAccountToProjectRequest = {
  awsAccountId: string;
};

export async function addAwsAccountToProjectAction(
  projectId: string,
  input: AddAwsAccountToProjectRequest,
) {
  if (!input.awsAccountId) {
    return {
      success: false as const,
      message: 'Please select an AWS account.',
    };
  }

  try {
    await ProjectAwsAccountApi.linkAwsAccountToProject(
      projectId,
      input.awsAccountId,
    );
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
  revalidatePath('/project');

  return {
    success: true as const,
  };
}

export async function removeAwsAccountFromProjectAction(
  projectId: string,
  awsAccountId: string,
) {
  try {
    await ProjectAwsAccountApi.removeAwsAccount(projectId, awsAccountId);

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
