import { Metadata } from 'next';
import {
  Download,
  FolderClosed,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ProjectStatus } from '@/lib/api/api-type';
import { projectApi } from '@/lib/api/project.api';
import { cn } from '@/lib/utils';
import CreateProjectForm from '@/components/feature/project/CreateProjectForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projects',
};

// บังคับให้หน้าโหลดข้อมูลใหม่ ไม่ใช้ค่าที่ cache ไว้
export const dynamic = 'force-dynamic';

type ProjectRow = {
  id: string;
  name: string;
  category: string;
  business: string;
  technical: string;
  resources: number;
  costMtd: string;
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

export default async function ProjectListPage() {
  const response = await projectApi.getProject();

  const projects: ProjectRow[] = response.items.map((project) => ({
    id: project.id,
    name: project.projectName,

    // ถ้า response ไม่มี description ให้ใช้ projectCode แทนได้
    category: project.description ?? project.projectCode ?? '-',

    business: project.businessDepartment,
    technical: project.technicalDepartment,
    resources: project._count.resources,
    costMtd: '$0.00',
    budgetUsage: 0,
    status: project.status,
    lastUpdated: project.updatedAt,
  }));

  const activeCount = projects.filter(
    (project) => project.status === 'ACTIVE',
  ).length;

  const totalResources = projects.reduce(
    (total, project) => total + project.resources,
    0,
  );

  const start =
    response.totalItems === 0 ? 0 : (response.page - 1) * response.limit + 1;

  const end = Math.min(response.page * response.limit, response.totalItems);

  return (
    <div className="space-y-6 p-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        </div>

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
          value="$0.00"
          valueClassName="text-primary"
        />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search projects, owners, teams..."
              className="pl-8"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <SlidersHorizontal />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {projects.length} of {response.totalItems} projects
          </span>

          <Button variant="outline">
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
                  No projects found
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
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderClosed className="size-4" />
                          </span>

                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {project.name}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {project.category}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">
                        {project.business}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">
                        {project.technical}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {project.resources}
                    </TableCell>

                    <TableCell className="font-medium">
                      {project.costMtd}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={project.budgetUsage}
                          className={cn(
                            'w-24 gap-0',
                            isHighUsage
                              ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
                              : '[&_[data-slot=progress-indicator]]:bg-primary',
                          )}
                        />

                        <span
                          className={cn(
                            'w-9 text-xs font-medium tabular-nums',
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Showing {start}–{end} of {response.totalItems} projects
          </span>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              {Array.from({ length: response.totalPages }, (_, index) => {
                const page = index + 1;
                const isActive = response.page === page;

                return (
                  <PaginationItem key={page}>
                    <a
                      href={`?page=${page}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                      )}
                    >
                      {page}
                    </a>
                  </PaginationItem>
                );
              })}
            </PaginationContent>
          </Pagination>
        </div>
      </Card>
    </div>
  );
}
