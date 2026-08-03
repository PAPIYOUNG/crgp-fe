import { Database, Eye, Pen } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import EditAwsAccountForm from '@/components/feature/aws-account/EditAwsAccountForm';
import { AwsAccountResponse } from '@/lib/api/api-type';
import AwsSyncForm from '@/components/feature/aws-account/AwsSyncForm';

export type AwsAccountHealth = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export type AwsAccountCardData = {
  id: string;
  name: string;
  accountId: string;
  owner: string;
  health: AwsAccountHealth;
  resourceCount: number;
  defaultRegion: string;
  costMtd: number;
  totalCost: number;
  costCurrency: string;
  consoleUrl?: string | null;
  resourcesHref?: string;
};

const healthConfig: Record<
  AwsAccountHealth,
  { dot: string; className: string; label: string }
> = {
  HEALTHY: {
    dot: 'bg-green-500',
    className:
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    label: 'Healthy',
  },
  WARNING: {
    dot: 'bg-amber-500',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    label: 'Warning',
  },
  CRITICAL: {
    dot: 'bg-red-500',
    className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    label: 'Critical',
  },
};

type AwsAccountCardProps = {
  account: AwsAccountCardData;
  rawAccount: AwsAccountResponse;
};

export default function AwsAccountCard({
  account,
  rawAccount,
}: AwsAccountCardProps) {
  const health = healthConfig[account.health];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Database className="size-5" />
          </span>

          <div>
            <p className="font-semibold text-foreground">{account.name}</p>
            <p className="font-mono text-sm text-muted-foreground">
              {account.accountId}
            </p>
          </div>
        </div>
        <div className="flex w-36 flex-col gap-3">
          <Badge
            className={cn(
              'w-full justify-center gap-1.5 shadow-md',
              health.className,
            )}
          >
            <span className={cn('size-1.5 rounded-full ', health.dot)} />
            {health.label}
          </Badge>

          <AwsSyncForm awsAccountId={account.id} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Account ID
          </p>
          <p className="mt-1 font-mono text-sm font-medium text-foreground">
            {account.accountId}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Owner
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {account.owner}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Resources
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {account.resourceCount}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Default Region
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {account.defaultRegion}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wide text-muted-foreground">
            Cost MTD
          </span>

          <span className="font-medium uppercase tracking-wide text-muted-foreground">
            Total Cost
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {account.costMtd} {account.costCurrency}
          </span>

          <span className="text-sm font-semibold text-foreground">
            {account.totalCost} {account.costCurrency}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <a
          href={account.resourcesHref ?? '#'}
          className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
        >
          <Eye className="size-3.5" />
          View Resources
        </a>
        <EditAwsAccountForm account={rawAccount} />
      </div>
    </Card>
  );
}
