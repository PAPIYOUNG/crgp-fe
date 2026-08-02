import {
  CloudResourceResponse,
  GetCloudResourcesResponse,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const cloudResourceApi = {
  // The backend has been observed returning either a bare array or the
  // paginated { items, pagination } shape — normalize at the call site.
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

  async EditCloudResource(
    cloudResourceId: string,
    data: Partial<CloudResourceResponse>,
  ): Promise<CloudResourceResponse> {
    return authFetch(`/cloud-resource/${cloudResourceId}`, {
      method: 'PATCH',
      body: data,
    });
  },
};
