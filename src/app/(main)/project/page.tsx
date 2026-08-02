import ProjectListPage from '@/components/feature/project/ProjectListPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
};

export default function Page() {
  return <ProjectListPage />;
}
