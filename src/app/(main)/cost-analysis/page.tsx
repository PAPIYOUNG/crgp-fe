import type { Metadata } from 'next';

import CostAnalysisPage from '@/components/feature/cost/CostAnalysisPage';

export const metadata: Metadata = {
  title: 'Cost Analysis',
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return <CostAnalysisPage />;
}
