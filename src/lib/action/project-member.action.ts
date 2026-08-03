'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/api-error';
import { projectMemberApi } from '@/lib/api/project-member.api';
import type { AddProjectMemberRequest } from '@/lib/api/api-type';

export async function addProjectMemberAction(
  projectId: string,
  input: AddProjectMemberRequest,
) {
  if (!projectId) {
    return {
      success: false as const,
      message: 'Project ID is required.',
    };
  }

  if (!input.userId) {
    return {
      success: false as const,
      message: 'Please select a user.',
    };
  }

  if (input.memberRole !== 'MEMBER' && input.memberRole !== 'TECHNICAL_OWNER') {
    return {
      success: false as const,
      message: 'Please select a valid project role.',
    };
  }

  try {
    await projectMemberApi.addProjectMember(projectId, input);
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

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/project');

  return {
    success: true as const,
  };
}

export async function removeMemberFromProjectAction(
  projectId: string,
  userId: string,
) {
  if (!projectId) {
    return {
      success: false as const,
      message: 'Project ID is required.',
    };
  }

  if (!userId) {
    return {
      success: false as const,
      message: 'Please select a user.',
    };
  }
  try {
    await projectMemberApi.removeMember(projectId, userId);

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
