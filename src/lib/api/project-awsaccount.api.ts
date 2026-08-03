import { authFetch } from '@/lib/api/auth-fetch';

export const ProjectAwsAccountApi = {
  async linkAwsAccountToProject(projectId: string, awsAccountId: string) {
    return authFetch(`/project/${projectId}/aws-account`, {
      method: 'POST',
      body: { awsAccountId },
    });
  },

  async removeAwsAccount(
    projectId: string,
    awsAccountId: string,
  ): Promise<void> {
    await authFetch(`/project/${projectId}/aws-account/${awsAccountId}`, {
      method: 'DELETE',
    });
  },
};
