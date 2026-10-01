import Link from 'next/link';
import {
  AlertTriangle,
  DollarSign,
  PiggyBank,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { AwsAccountApi } from '@/lib/api/aws-account.api';
import { projectApi } from '@/lib/api/project.api';
import type { ProjectStatus } from '@/lib/api/api-type';
import { cn } from '@/lib/utils';

const PROJECT_SAMPLE_LIMIT = 100;

const statusConfig: Record<ProjectStatus, { dot: string; className: string }> = {
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
  valueClassName,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
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
          <p
            className={cn(
              'mt-1 truncate text-2xl font-semibold text-foreground',
              valueClassName,
            )}
          >
            {value}
          </p>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function CostBarRow({
  href,
  label,
  sublabel,
  displayValue,
  value,
  maxValue,
}: {
  href: string;
  label: string;
  sublabel: string;
  displayValue: string;
  value: number;
  maxValue: number;
}) {
  const width =
    maxValue > 0 ? Math.max((value / maxValue) * 100, value > 0 ? 3 : 0) : 0;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md py-1 hover:opacity-80"
    >
      <div className="flex w-36 shrink-0 flex-col truncate sm:w-44">
        <span className="truncate text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {sublabel}
        </span>
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
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{message}</p>
  );
}

export default async function CostAnalysisPage() {
  const [awsAccounts, projectsResponse] = await Promise.all([
    AwsAccountApi.getAwsAccountList(),
    projectApi.getProject({
      limit: PROJECT_SAMPLE_LIMIT,
      sortBy: 'updatedAt',
      order: 'desc',
    }),
  ]);

  const totalCostMtd = awsAccounts.items.reduce(
    (total, account) => total + Number(account.costMtd ?? 0),
    0,
  );

  const totalCostAllTime = awsAccounts.items.reduce(
    (total, account) => total + Number(account.totalCost ?? 0),
    0,
  );

  const accountsByCost = [...awsAccounts.items].sort(
    (a, b) => Number(b.costMtd ?? 0) - Number(a.costMtd ?? 0),
  );

  const maxAccountCost = Math.max(
    ...accountsByCost.map((account) => Number(account.costMtd ?? 0)),
    0,
  );

  const projects = projectsResponse.items;

  const budgetedProjects = projects.filter(
    (project) => project.monthlyBudget !== null,
  );

  const projectsOverBudget = budgetedProjects.filter(
    (project) => project.budgetUsage > 100,
  );

  const avgBudgetUsage =
    budgetedProjects.length > 0
      ? budgetedProjects.reduce((total, project) => total + project.budgetUsage, 0) /
        budgetedProjects.length
      : 0;

  const projectsByCost = [...projects].sort(
    (a, b) => Number(b.costMtd) - Number(a.costMtd),
  );

  const maxProjectCost = Math.max(
    ...projectsByCost.map((project) => Number(project.costMtd)),
    0,
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Cost Analysis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Spend across {awsAccounts.totalItems} AWS account
          {awsAccounts.totalItems === 1 ? '' : 's'} and{' '}
          {projectsResponse.totalItems} project
          {projectsResponse.totalItems === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="Cost MTD"
          value={formatMoney(totalCostMtd, 'USD')}
          valueClassName="text-primary"
          hint="Across all AWS accounts"
        />
        <KpiCard
          icon={TrendingUp}
          label="Total Cost"
          value={formatMoney(totalCostAllTime, 'USD')}
          hint="All-time, all accounts"
        />
        <KpiCard
          icon={PiggyBank}
          label="Avg Budget Usage"
          value={`${avgBudgetUsage.toFixed(0)}%`}
          hint={`${budgetedProjects.length} budgeted project${budgetedProjects.length === 1 ? '' : 's'}`}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Over Budget"
          value={String(projectsOverBudget.length)}
          valueClassName={
            projectsOverBudget.length > 0
              ? 'text-red-600 dark:text-red-400'
              : undefined
          }
          hint="Projects past their monthly budget"
        />
      </div>

      {projectsOverBudget.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>
            {projectsOverBudget.length} project
            {projectsOverBudget.length === 1 ? '' : 's'} over budget
          </AlertTitle>
          <AlertDescription>
            {projectsOverBudget.map((project) => project.projectName).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Cost by AWS Account
            </h2>
            <Link
              href="/aws-accounts"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {accountsByCost.length === 0 ? (
              <EmptyState message="No AWS accounts connected yet." />
            ) : (
              accountsByCost.map((account) => (
                <CostBarRow
                  key={account.id}
                  href={`/cloud-resources?awsAccountId=${account.id}`}
                  label={account.accountName}
                  sublabel={account.defaultRegion}
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

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Cost by Project</h2>
            <Link
              href="/project"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {projectsByCost.length === 0 ? (
              <EmptyState message="No projects yet." />
            ) : (
              projectsByCost.map((project) => (
                <CostBarRow
                  key={project.id}
                  href={`/project/${project.id}`}
                  label={project.projectName}
                  sublabel={project.businessDepartment.replaceAll('_', ' ')}
                  value={Number(project.costMtd)}
                  maxValue={maxProjectCost}
                  displayValue={formatMoney(
                    Number(project.costMtd),
                    project.budgetCurrency,
                  )}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="font-semibold text-foreground">Project Budgets</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Project
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Monthly Budget
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cost MTD
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Budget Usage
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Remaining
              </TableHead>
              <TableHead className="h-11 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No projects yet.
                </TableCell>
              </TableRow>
            ) : (
              projectsByCost.map((project) => {
                const status = statusConfig[project.status];
                const isOverBudget = project.budgetUsage > 100;
                const isHighUsage = project.budgetUsage >= 60;

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/project/${project.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {project.projectName}
                      </Link>
                    </TableCell>

                    <TableCell>
                      {project.monthlyBudget
                        ? formatMoney(
                            Number(project.monthlyBudget),
                            project.budgetCurrency,
                          )
                        : 'No budget set'}
                    </TableCell>

                    <TableCell className="font-medium">
                      {formatMoney(
                        Number(project.costMtd),
                        project.budgetCurrency,
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(project.budgetUsage, 100)}
                          className={cn(
                            'w-24 gap-0',
                            isOverBudget
                              ? '[&_[data-slot=progress-indicator]]:bg-red-500'
                              : isHighUsage
                                ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
                                : '[&_[data-slot=progress-indicator]]:bg-primary',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-medium tabular-nums text-muted-foreground',
                            isOverBudget && 'text-red-600 dark:text-red-400',
                          )}
                        >
                          {project.budgetUsage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell
                      className={cn(
                        isOverBudget && 'text-red-600 dark:text-red-400',
                      )}
                    >
                      {project.remainingBudget
                        ? formatMoney(
                            Number(project.remainingBudget),
                            project.budgetCurrency,
                          )
                        : '—'}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className={cn('gap-1.5', status.className)}>
                        <span className={cn('size-1.5 rounded-full', status.dot)} />
                        {project.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
