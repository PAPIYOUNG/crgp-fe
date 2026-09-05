import { Metadata } from 'next';

import DashboardPage from '@/components/feature/dashboard/DashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function Home() {
  return <DashboardPage />;
}
