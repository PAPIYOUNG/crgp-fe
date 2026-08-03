import {
  CloudResourceResponse,
  GetCloudResourcesResponse,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const cloudResourceApi = {
  async getCloudResourceList(): Promise<
    CloudResourceResponse[] | GetCloudResourcesResponse
  > {
    return authFetch('/cloud-resource');
  },

  async getOneCloudResource(
    cloudResourceId: string,
  ): Promise<CloudResourceResponse> {
    return authFetch(`/cloud-resource/${cloudResourceId}`);
  },

  async getCloudResourcesByAwsAccount(
    awsAccountId: string,
  ): Promise<CloudResourceResponse[]> {
    const params = new URLSearchParams({
      awsAccountId,
      unassigned: 'true',
      isDeleted: 'false',
      limit: '100',
    });
    const response = await authFetch<GetCloudResourcesResponse>(
      `/cloud-resource?${params.toString()}`,
    );
    return response.items;
  },

  async editCloudResource(
    cloudResourceId: string,
    data: Partial<CloudResourceResponse>,
  ): Promise<CloudResourceResponse> {
    return authFetch(`/cloud-resource/${cloudResourceId}`, {
      method: 'PATCH',
      body: data,
    });
  },

  async removeResourceFromProject(resourceId: string) {
    return authFetch(`/cloud-resource/${resourceId}`, {
      method: 'PATCH',
      body: {
        projectId: null,
      },
    });
  },
};
