import {
  CreateAwsAccountRequest,
  GetAwsAccountsResponse,
  UpdateAwsAccountRequest,
  VerifyAwsAccountResponse,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const AwsAccountApi = {
  async getAwsAccountList(): Promise<GetAwsAccountsResponse> {
    return authFetch<GetAwsAccountsResponse>('/aws');
  },

  async createAwsAccount(input: CreateAwsAccountRequest): Promise<void> {
    return authFetch('/aws', {
      method: 'POST',
      body: input,
    });
  },

  async updateAwsAccount(
    awsAccountId: string,
    data: UpdateAwsAccountRequest,
  ): Promise<void> {
    await authFetch(`/aws/${awsAccountId}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async verifyAwsAccount(
    awsAccountId: string,
  ): Promise<VerifyAwsAccountResponse> {
    return authFetch<VerifyAwsAccountResponse>(`/aws/${awsAccountId}/verify`, {
      method: 'POST',
    });
  },
};
