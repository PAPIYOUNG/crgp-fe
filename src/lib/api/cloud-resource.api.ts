import type {
  CloudResourceResponse,
  CloudResourceUpdateRequest,
  GetCloudResourcesQuery,
  GetCloudResourcesResponse,
} from '@/lib/api/api-type';

import { authFetch } from '@/lib/api/auth-fetch';
function createCloudResourceQueryString(query: GetCloudResourcesQuery): string {
  const params = new URLSearchParams();

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.limit) {
    params.set('limit', String(query.limit));
  }

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.service) {
    params.set('service', query.service);
  }

  if (query.region) {
    params.set('region', query.region);
  }

  if (query.projectId) {
    params.set('projectId', query.projectId);
  }

  return params.toString();
}
export const cloudResourceApi = {
  async getCloudResourceList(
    query: GetCloudResourcesQuery = {},
  ): Promise<GetCloudResourcesResponse> {
    const queryString = createCloudResourceQueryString(query);

    const endpoint = queryString
      ? `/cloud-resource?${queryString}`
      : '/cloud-resource';

    return authFetch<GetCloudResourcesResponse>(endpoint);
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
