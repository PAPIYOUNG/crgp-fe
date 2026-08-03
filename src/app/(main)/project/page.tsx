import ProjectListPage from '@/components/feature/project/ProjectListPage';

export type ProjectSearchParams = {
  search?: string;
  status?: string;
  businessDepartment?: string;
  technicalDepartment?: string;
  sortBy?: string;
  order?: string;
  page?: string;
  limit?: string;
};

type ProjectPageProps = {
  searchParams: Promise<ProjectSearchParams>;
};

export default async function ProjectPage({ searchParams }: ProjectPageProps) {
  const params = await searchParams;

  return <ProjectListPage searchParams={params} />;
}
