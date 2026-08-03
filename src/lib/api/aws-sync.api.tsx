import type { SyncAllAwsResponse } from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const awsSyncApi = {
  async syncAll(awsAccountId: string): Promise<SyncAllAwsResponse> {
    return authFetch<SyncAllAwsResponse>(`/aws-sync/${awsAccountId}/sync-all`, {
      method: 'POST',
    });
  },
};
