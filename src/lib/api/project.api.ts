import {
  CreateProjectRequest,
  GetOneProjectResponse,
  GetProjectsResponse,
  UpdateProjectRequest,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const projectApi = {
  async getProject(): Promise<GetProjectsResponse> {
    return authFetch('/project');
  },

  async createProject(data: CreateProjectRequest): Promise<void> {
    return authFetch('/project', {
      method: 'POST',
      body: data,
    });
  },

  async getOneProject(projectId: string): Promise<GetOneProjectResponse> {
    return authFetch(`/project/${projectId}`);
  },

  async updateProject(
    projectId: string,
    data: UpdateProjectRequest,
  ): Promise<void> {
    return authFetch(`/project/${projectId}`, {
      method: 'PATCH',
      body: data,
    });
  },
};
