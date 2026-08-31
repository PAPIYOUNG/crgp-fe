import type { Metadata } from 'next';
import { Download, FolderClosed } from 'lucide-react';
import Link from 'next/link';

import CreateProjectForm from '@/components/feature/project/CreateProjectForm';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

import type {
  Department,
  GetProjectsQuery,
  ProjectSortField,
  ProjectStatus,
  SortOrder,
} from '@/lib/api/api-type';

import { projectApi } from '@/lib/api/project.api';
import { cn } from '@/lib/utils';
import { ProjectFilters } from '@/components/feature/project/ProjectFilters';
import { ProjectSearchParams } from '@/app/(main)/project/page';
import { ProjectPagination } from '@/components/feature/project/ProjectPagination';

export const metadata: Metadata = {
  title: 'Projects',
};

// บังคับให้หน้าโหลดข้อมูลใหม่ ไม่ใช้ข้อมูล cache
export const dynamic = 'force-dynamic';

type ProjectListPageProps = {
  searchParams: ProjectSearchParams;
};

type ProjectRow = {
  id: string;
  name: string;
  category: string;
  business: string;
  technical: string;
  resources: number;
  costMtd: number;
  budgetCurrency: string;
  budgetUsage: number;
  status: ProjectStatus;
  lastUpdated: string;
};

const statusConfig: Record<
  ProjectStatus,
  {
    dot: string;
    className: string;
  }
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

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card className="gap-1.5 px-5 py-4">
      <span className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </span>

      <span className={cn('text-2xl font-semibold', valueClassName)}>
        {value}
      </span>
    </Card>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function createPageHref(currentParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(currentParams.toString());

  params.set('page', String(page));

  return `?${params.toString()}`;
}

export default async function ProjectListPage({
  searchParams,
}: ProjectListPageProps) {
  const params = searchParams;
  console.log(params.search);
  const query: GetProjectsQuery = {
    search: params.search,

    status: params.status as ProjectStatus | undefined,

    businessDepartment: params.businessDepartment as Department | undefined,

    technicalDepartment: params.technicalDepartment as Department | undefined,

    sortBy: (params.sortBy as ProjectSortField | undefined) ?? 'updatedAt',

    order: (params.order as SortOrder | undefined) ?? 'desc',

    page: parsePositiveInteger(params.page, 1),

    limit: parsePositiveInteger(params.limit, 10),
  };

  const response = await projectApi.getProject(query);

  const projects: ProjectRow[] = response.items.map((project) => ({
    id: project.id,

    name: project.projectName,

    category: project.description ?? project.projectCode ?? '-',

    business: project.businessDepartment,

    technical: project.technicalDepartment,

    resources: project._count.resources,

    costMtd: Number(project.costMtd),

    budgetCurrency: project.budgetCurrency,

    budgetUsage: project.budgetUsage,

    status: project.status,

    lastUpdated: project.updatedAt,
  }));

  /*
   * ตอนนี้ 3 ค่านี้คำนวณจาก projects ในหน้าปัจจุบัน
   * ถ้า limit = 10 จะรวมเฉพาะ 10 รายการในหน้านั้น
   */
  const activeCount = projects.filter(
    (project) => project.status === 'ACTIVE',
  ).length;

  const totalResources = projects.reduce(
    (total, project) => total + project.resources,
    0,
  );

  const totalCostMtd = projects.reduce(
    (total, project) => total + project.costMtd,
    0,
  );

  const summaryCurrency = projects[0]?.budgetCurrency ?? 'USD';

  const start =
    response.totalItems === 0 ? 0 : (response.page - 1) * response.limit + 1;

  const end = Math.min(response.page * response.limit, response.totalItems);

  /*
   * ใช้สร้าง pagination โดยรักษา filter เดิมไว้
   *
   * เช่น:
   * ?status=ACTIVE&businessDepartment=FINANCE&page=2
   */
  const paginationParams = new URLSearchParams();

  if (params.search) {
    paginationParams.set('search', params.search);
  }

  if (params.status) {
    paginationParams.set('status', params.status);
  }

  if (params.businessDepartment) {
    paginationParams.set('businessDepartment', params.businessDepartment);
  }

  if (params.technicalDepartment) {
    paginationParams.set('technicalDepartment', params.technicalDepartment);
  }

  if (params.sortBy) {
    paginationParams.set('sortBy', params.sortBy);
  }

  if (params.order) {
    paginationParams.set('order', params.order);
  }

  if (params.limit) {
    paginationParams.set('limit', params.limit);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page heading */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>

        <CreateProjectForm />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL PROJECTS" value={String(response.totalItems)} />

        <StatCard
          label="ACTIVE PROJECTS"
          value={String(activeCount)}
          valueClassName="text-green-600 dark:text-green-400"
        />

        <StatCard label="TOTAL RESOURCES" value={String(totalResources)} />

        <StatCard
          label="TOTAL COST MTD"
          value={formatMoney(totalCostMtd, summaryCurrency)}
          valueClassName="text-primary"
        />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <ProjectFilters />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {projects.length} of {response.totalItems} projects
          </span>

          <Button type="button" variant="outline">
            <Download />
            Export
          </Button>
        </div>
      </div>

      {/* Projects table */}
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Project
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Business Owner
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Technical Owner
              </TableHead>

              <TableHead className="h-11 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Resources
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cost MTD
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Budget Usage
              </TableHead>

              <TableHead className="h-11 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Last Updated
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  No projects match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const status = statusConfig[project.status];

                const isHighUsage = project.budgetUsage >= 60;

                return (
                  <TableRow key={project.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/project/${project.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FolderClosed className="size-4" />
                        </span>

                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium text-foreground">
                            {project.name}
                          </span>

                          <span className="truncate text-xs text-muted-foreground">
                            {project.category}
                          </span>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">
                        {project.business.replaceAll('_', ' ')}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">
                        {project.technical.replaceAll('_', ' ')}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {project.resources}
                    </TableCell>

                    <TableCell className="font-medium">
                      {formatMoney(project.costMtd, project.budgetCurrency)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(project.budgetUsage, 100)}
                          className={cn(
                            'w-24 gap-0',
                            isHighUsage
                              ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
                              : '[&_[data-slot=progress-indicator]]:bg-primary',
                          )}
                        />

                        <span
                          className={cn(
                            'w-12 text-xs font-medium tabular-nums',
                            isHighUsage
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-foreground',
                          )}
                        >
                          {project.budgetUsage}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className={cn('gap-1.5', status.className)}>
                        <span
                          className={cn('size-1.5 rounded-full', status.dot)}
                        />

                        {project.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(project.lastUpdated)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {start}–{end} of {response.totalItems} projects
          </span>

          <ProjectPagination
            currentPage={response.page}
            totalPages={response.totalPages}
          />
        </div>
      </Card>
    </div>
  );
}
