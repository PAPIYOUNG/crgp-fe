import type { AddProjectMemberRequest } from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const projectMemberApi = {
  async addProjectMember(
    projectId: string,
    data: AddProjectMemberRequest,
  ): Promise<void> {
    await authFetch(`/project/${projectId}/member`, {
      method: 'POST',
      body: data,
    });
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await authFetch(`/project/${projectId}/member/${userId}`, {
      method: 'DELETE',
    });
  },
};
