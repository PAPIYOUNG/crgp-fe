import type {
  CloudResourceResponse,
  CloudResourceUpdateRequest,
  GetCloudResourcesResponse,
} from '@/lib/api/api-type';

import { authFetch } from '@/lib/api/auth-fetch';

export const cloudResourceApi = {
  async getCloudResourceList(): Promise<GetCloudResourcesResponse> {
    return authFetch<GetCloudResourcesResponse>('/cloud-resource');
  },

  async getOneCloudResource(
    cloudResourceId: string,
  ): Promise<CloudResourceResponse> {
    return authFetch<CloudResourceResponse>(
      `/cloud-resource/${cloudResourceId}`,
    );
  },

  async editCloudResource(
    cloudResourceId: string,
    data: CloudResourceUpdateRequest,
  ): Promise<CloudResourceResponse> {
    return authFetch<CloudResourceResponse>(
      `/cloud-resource/${cloudResourceId}`,
      {
        method: 'PATCH',
        body: data,
      },
    );
  },
};
