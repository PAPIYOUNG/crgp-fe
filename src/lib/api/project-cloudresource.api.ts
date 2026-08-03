import {
  CloudResourceResponse,
  GetCloudResourcesQuery,
  GetCloudResourcesResponse,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';
function createCloudResourceQueryString(query: GetCloudResourcesQuery): string {
  const params = new URLSearchParams();

  const search = query.search?.trim();

  if (search) {
    params.set('search', search);
  }

  if (query.awsAccountId) {
    params.set('awsAccountId', query.awsAccountId);
  }

  if (query.projectId) {
    params.set('projectId', query.projectId);
  }

  if (query.ownerId) {
    params.set('ownerId', query.ownerId);
  }

  if (query.resourceType) {
    params.set('resourceType', query.resourceType);
  }

  if (query.region) {
    params.set('region', query.region);
  }

  if (query.source) {
    params.set('source', query.source);
  }

  if (query.environment) {
    params.set('environment', query.environment);
  }

  if (query.isDeleted !== undefined) {
    params.set('isDeleted', String(query.isDeleted));
  }

  if (query.unassigned !== undefined) {
    params.set('unassigned', String(query.unassigned));
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
