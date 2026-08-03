import {
  CreateProjectRequest,
  GetOneProjectResponse,
  GetProjectsQuery,
  GetProjectsResponse,
  UpdateProjectRequest,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

function createProjectQueryString(query: GetProjectsQuery): string {
  const params = new URLSearchParams();

  const search = query.search?.trim();

  if (search) {
    params.set('search', search);
  }

  if (query.businessDepartment) {
    params.set('businessDepartment', query.businessDepartment);
  }

  if (query.technicalDepartment) {
    params.set('technicalDepartment', query.technicalDepartment);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.sortBy) {
    params.set('sortBy', query.sortBy);
  }

  if (query.order) {
    params.set('order', query.order);
  }

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.limit) {
    params.set('limit', String(query.limit));
  }

  return params.toString();
}
export const projectApi = {
  async getProject(query: GetProjectsQuery = {}): Promise<GetProjectsResponse> {
    const queryString = createProjectQueryString(query);

    const endpoint = queryString ? `/project?${queryString}` : '/project';

    return authFetch<GetProjectsResponse>(endpoint);
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
