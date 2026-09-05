import ResourceForm from '@/components/feature/cloud-resource/ResourceForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud Resource',
};

export default async function CloudResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = await params;

  return <ResourceForm resourceId={resourceId} />;
}
