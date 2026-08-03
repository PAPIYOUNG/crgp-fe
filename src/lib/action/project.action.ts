'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/api-error';
import { projectApi } from '@/lib/api/project.api';
import {
  CreateProjectInput,
  createProjectSchema,
} from '@/lib/schema/create-project.schema';
import {
  EditProjectInput,
  editProjectSchema,
} from '@/lib/schema/edit-project.schema';

export async function createProjectAction(input: CreateProjectInput) {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: 'Please check the project details and try again.',
    };
  }

  const data = parsed.data;

  const payload = {
    ...data,
    description: data.description || null,
    monthlyBudget: data.monthlyBudget ? Number(data.monthlyBudget) : null,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  };

  try {
    //console.log('payload sent to backend:', payload);

    await projectApi.createProject(payload);

    //console.log('project returned from backend:', project);
  } catch (error) {
    //console.error('create project error:', error);
    if (error instanceof ApiError) {
      return { success: false as const, message: error.message };
    }
    throw error;
  }

  revalidatePath('/project');
  return { success: true as const };
}

export async function updateProjectAction(
  projectId: string,
  input: EditProjectInput,
) {
  const parsed = editProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: 'Please check the project details and try again.',
    };
  }

  const data = parsed.data;

  const payload = {
    projectName: data.projectName,
    description: data.description || null,
    businessDepartment: data.businessDepartment || null,
    technicalDepartment: data.technicalDepartment || null,
    monthlyBudget: data.monthlyBudget ? Number(data.monthlyBudget) : null,
    budgetCurrency: data.budgetCurrency,
    status: data.status,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  };

  try {
    await projectApi.updateProject(projectId, payload);
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false as const, message: error.message };
    }
    throw error;
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/project');
  return { success: true as const };
}
