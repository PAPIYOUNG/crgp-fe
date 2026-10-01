import Link from 'next/link';
import {
  Cloud,
  Database,
  DollarSign,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { AwsAccountApi } from '@/lib/api/aws-account.api';
import { cloudResourceApi } from '@/lib/api/cloud-resource.api';
import { projectApi } from '@/lib/api/project.api';
import type { AwsAccountResponse, ProjectResponseItem, ProjectStatus } from '@/lib/api/api-type';
import { getServiceDisplay, serviceStats } from '@/lib/utils/cloud-resource-display';

const RECENT_RESOURCE_LIMIT = 6;
const PROJECT_SAMPLE_LIMIT = 50;
const TOP_ACCOUNTS_LIMIT = 6;
const TOP_PROJECTS_LIMIT = 5;

const projectStatusConfig: Record<
  ProjectStatus,
  { dot: string; className: string }
> = {
  ACTIVE: {
    dot: 'bg-green-500',
    className:
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  },
  ARCHIVED: {
    dot: 'bg-amber-500',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
  INACTIVE: {
    dot: 'bg-muted-foreground',
    className: 'bg-muted text-muted-foreground',
  },
};

function isHealthyAccount(account: AwsAccountResponse) {
  return (
    account.isActive &&
    account.connectionStatus === 'CONNECTED' &&
    !account.connectionError
  );
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-semibold text-foreground">
            {value}
          </p>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function BarRow({
  label,
  displayValue,
  value,
  maxValue,
  dotClassName,
}: {
  label: string;
  displayValue: string;
  value: number;
  maxValue: number;
  dotClassName?: string;
}) {
  const width = maxValue > 0 ? Math.max((value / maxValue) * 100, value > 0 ? 3 : 0) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-28 shrink-0 items-center gap-2 truncate text-sm font-medium text-foreground sm:w-36">
        {dotClassName && (
          <span className={cn('size-1.5 shrink-0 rounded-full bg-current', dotClassName)} />
        )}
        <span className="truncate">{label}</span>
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#2a78d6] dark:bg-[#3987e5]"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="w-20 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
        {displayValue}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{message}</p>
  );
}

export default async function DashboardPage() {
  const [awsAccounts, cloudResources, projects] = await Promise.all([
    AwsAccountApi.getAwsAccountList(),
    cloudResourceApi.getCloudResourceList({ limit: RECENT_RESOURCE_LIMIT }),
    projectApi.getProject({
      limit: PROJECT_SAMPLE_LIMIT,
      sortBy: 'updatedAt',
      order: 'desc',
    }),
  ]);

  const healthyAccountCount = awsAccounts.items.filter(isHealthyAccount).length;

  const totalCostMtd = awsAccounts.items.reduce(
    (total, account) => total + Number(account.costMtd ?? 0),
    0,
  );

  const activeProjectCount = projects.items.filter(
    (project) => project.status === 'ACTIVE',
  ).length;

  const topAccountsByCost = [...awsAccounts.items]
    .sort((a, b) => Number(b.costMtd ?? 0) - Number(a.costMtd ?? 0))
    .slice(0, TOP_ACCOUNTS_LIMIT);

  const maxAccountCost = Math.max(
    ...topAccountsByCost.map((account) => Number(account.costMtd ?? 0)),
    0,
  );

  const resourceBreakdown = serviceStats
    .map((service) => ({
      ...service,
      count: cloudResources.summary[service.key] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const maxResourceCount = Math.max(
    ...resourceBreakdown.map((service) => service.count),
    0,
  );

  const topProjectsByCost = [...projects.items]
    .sort((a, b) => Number(b.costMtd) - Number(a.costMtd))
    .slice(0, TOP_PROJECTS_LIMIT);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview across {awsAccounts.totalItems} AWS account
          {awsAccounts.totalItems === 1 ? '' : 's'}, {cloudResources.pagination.totalItems}{' '}
          resources and {projects.totalItems} project
          {projects.totalItems === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Database}
          label="AWS Accounts"
          value={String(awsAccounts.totalItems)}
          hint={`${healthyAccountCount} healthy`}
        />
        <KpiCard
          icon={Cloud}
          label="Cloud Resources"
          value={String(cloudResources.pagination.totalItems)}
        />
        <KpiCard
          icon={FolderKanban}
          label="Projects"
          value={String(projects.totalItems)}
          hint={`${activeProjectCount} active`}
        />
        <KpiCard
          icon={DollarSign}
          label="Cost MTD"
          value={formatMoney(totalCostMtd, 'USD')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Cost by AWS Account</h2>
            <Link
              href="/aws-accounts"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {topAccountsByCost.length === 0 ? (
              <EmptyState message="No AWS accounts connected yet." />
            ) : (
              topAccountsByCost.map((account) => (
                <BarRow
                  key={account.id}
                  label={account.accountName}
                  value={Number(account.costMtd ?? 0)}
                  maxValue={maxAccountCost}
                  displayValue={formatMoney(
                    Number(account.costMtd ?? 0),
                    account.costCurrency ?? 'USD',
                  )}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-foreground">Resource Breakdown</h2>

          <div className="mt-5 space-y-4">
            {maxResourceCount === 0 ? (
              <EmptyState message="No cloud resources synced yet." />
            ) : (
              resourceBreakdown
                .filter((service) => service.count > 0)
                .map((service) => (
                  <BarRow
                    key={service.key}
                    label={service.label}
                    value={service.count}
                    maxValue={maxResourceCount}
                    displayValue={String(service.count)}
                    dotClassName={service.className}
                  />
                ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Top Projects</h2>
            <Link
              href="/project"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {topProjectsByCost.length === 0 ? (
              <EmptyState message="No projects yet." />
            ) : (
              topProjectsByCost.map((project: ProjectResponseItem) => {
                const status = projectStatusConfig[project.status];

                return (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="block py-3 first:pt-0 last:pb-0 hover:opacity-80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {project.projectName}
                      </p>
                      <Badge className={cn('shrink-0 gap-1.5', status.className)}>
                        <span className={cn('size-1.5 rounded-full', status.dot)} />
                        {project.status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <Progress
                        value={Math.min(project.budgetUsage, 100)}
                        className="flex-1 gap-0"
                      />
                      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                        {formatMoney(Number(project.costMtd), project.budgetCurrency)} MTD
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Cloud Resources</h2>
            <Link
              href="/cloud-resources"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {cloudResources.items.length === 0 ? (
              <EmptyState message="No cloud resources yet." />
            ) : (
              cloudResources.items.map((resource) => {
                const service = getServiceDisplay(resource.resourceType);

                return (
                  <Link
                    key={resource.id}
                    href={`/cloud-resources/${resource.id}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {resource.resourceName ?? resource.resourceIdentifier}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {resource.awsAccount?.accountName ?? 'Unassigned'} ·{' '}
                        {resource.region}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('shrink-0', service.className)}>
                      {service.label}
                    </Badge>
                  </Link>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
