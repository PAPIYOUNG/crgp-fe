import CloudResourceListPage from '@/components/feature/cloud-resource/CloudResourceListPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud Resources',
};

export const dynamic = 'force-dynamic';

export type CloudResourceSearchParams = {
  page?: string;
  limit?: string;

  search?: string;

  awsAccountId?: string;
  projectId?: string;
  ownerId?: string;

  resourceType?: string;
  region?: string;

  source?: string;
  environment?: string;

  isDeleted?: string;
  unassigned?: string;

  sortBy?: string;
  order?: string;
};

type CloudResourcePageProps = {
  searchParams: Promise<CloudResourceSearchParams>;
};

export default async function CloudResourcePage({
  searchParams,
}: CloudResourcePageProps) {
  const params = await searchParams;

  return <CloudResourceListPage searchParams={params} />;
}
