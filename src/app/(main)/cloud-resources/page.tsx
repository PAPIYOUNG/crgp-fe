import { Metadata } from 'next';
import {
  Download,
  MapPin,
  RefreshCw,
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

import CloudResourceForm from '@/components/feature/cloud-resource/CloudResourceForm';
import { cloudResourceApi } from '@/lib/api/cloud-resource.api';
import { projectApi } from '@/lib/api/project.api';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cloud Resources',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 8;

const serviceStats = [
  {
    key: 'EC2',
    label: 'EC2',
    className: 'text-orange-600 dark:text-orange-400',
  },
  { key: 'RDS', label: 'RDS', className: 'text-blue-600 dark:text-blue-400' },
  { key: 'S3', label: 'S3', className: 'text-green-600 dark:text-green-400' },
  {
    key: 'LAMBDA',
    label: 'Lambda',
    className: 'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'EKS',
    label: 'EKS',
    className: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    key: 'LOAD_BALANCER',
    label: 'Load Balancer',
    className: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'WAF',
    label: 'WAF',
    className: 'text-red-600 dark:text-red-400',
  },
  {
    key: 'CDN',
    label: 'CDN',
    className: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'NETWORKING',
    label: 'Networking',
    className: 'text-purple-600 dark:text-purple-400',
  },
  { key: 'OTHER', label: 'Other', className: 'text-foreground' },
] as const;

// The 6 stat cards only cover these buckets (matches the summary row);
// everything else (CloudFront, IAM, DynamoDB, ...) rolls up into "Other".
const STAT_SERVICES = [
  'EC2',
  'RDS',
  'S3',
  'LAMBDA',
  'EKS',
  'NETWORKING',
  'LOAD_BALANCER',
  'WAF',
  'CDN',
] as const;

const serviceLabels: Record<string, string> = {
  EC2: 'EC2',
  RDS: 'RDS',
  S3: 'S3',
  LAMBDA: 'Lambda',
  EKS: 'EKS',
  NETWORKING: 'Networking',
  LOAD_BALANCER: 'Load Balancer',
  WAF: 'WAF',
  CDN: 'CDN',
  CLOUDFRONT: 'CloudFront',
};

const serviceBadgeStyles: Record<string, string> = {
  EC2: 'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-400',
  RDS: 'border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-green-400',
  S3: 'border-green-200 text-green-700 dark:border-green-500/30 dark:text-green-400',
  LAMBDA:
    'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-400',
  EKS: 'border-indigo-200 text-indigo-700 dark:border-indigo-500/30 dark:text-orange-400',
  NETWORKING:
    'border-purple-200 text-purple-700 dark:border-purple-500/30 dark:text-indigo-400',
  LOAD_BALANCER:
    'border-cyan-200 text-cyan-700 dark:border-cyan-500/30 dark:text-violet-400',
  WAF: 'border-red-200 text-red-700 dark:border-red-500/30 dark:text-violet-400',
  CDN: 'border-violet-200 text-violet-700 dark:border-violet-500/30 dark:text-violet-400',
  CLOUDFRONT:
    'border-violet-200 text-violet-700 dark:border-violet-500/30 dark:text-violet-400',
};

function getServiceSegment(resourceType: string) {
  return resourceType.split('::')[1]?.toUpperCase() ?? 'OTHER';
}

// Bucket used for the 6 summary stat cards only.
function getStatCategory(resourceType: string) {
  switch (resourceType) {
    case 'AWS::EC2::Instance':
      return 'EC2';

    case 'AWS::RDS::DBInstance':
    case 'AWS::RDS::DBCluster':
      return 'RDS';

    case 'AWS::S3::Bucket':
      return 'S3';

    case 'AWS::Lambda::Function':
      return 'LAMBDA';

    case 'AWS::EKS::Cluster':
      return 'EKS';

    case 'AWS::EC2::RouteTable':
    case 'AWS::EC2::NetworkAcl':
    case 'AWS::EC2::SecurityGroup':
    case 'AWS::EC2::Subnet':
    case 'AWS::EC2::VPC':
    case 'AWS::EC2::InternetGateway':
    case 'AWS::EC2::NatGateway':
      return 'NETWORKING';

    default:
      return 'OTHER';
  }
}

// Display label + badge style used in the table's Service column — shows
// the real AWS service (e.g. CloudFront, IAM), not just the 6 stat buckets.
function getServiceDisplay(resourceType: string) {
  const segment = getServiceSegment(resourceType);
  return {
    label: serviceLabels[segment] ?? segment,
    className:
      serviceBadgeStyles[segment] ?? 'border-border text-muted-foreground',
  };
}

function getStatusStyle(status: string | null) {
  const normalized = status?.toLowerCase() ?? '';

  if (['running', 'available', 'active'].some((s) => normalized.includes(s))) {
    return {
      dot: 'bg-green-500',
      className:
        'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    };
  }

  if (['stopped', 'pending', 'stopping'].some((s) => normalized.includes(s))) {
    return {
      dot: 'bg-amber-500',
      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    };
  }

  if (
    ['terminated', 'error', 'failed', 'deleted'].some((s) =>
      normalized.includes(s),
    )
  ) {
    return {
      dot: 'bg-red-500',
      className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };
  }

  return {
    dot: 'bg-muted-foreground',
    className: 'bg-muted text-muted-foreground',
  };
}

function StatCard({
  label,
  value,
  labelClassName,
}: {
  label: string;
  value: number;
  labelClassName?: string;
}) {
  return (
    <Card className="gap-1.5 px-5 py-4">
      <span className={cn('text-sm font-semibold', labelClassName)}>
        {label}
      </span>
      <span className="text-2xl font-semibold text-foreground">{value}</span>
    </Card>
  );
}

export default async function CloudResourceListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam } = await searchParams;

  const [cloudResourcesResponse, projectsResponse] = await Promise.all([
    cloudResourceApi.getCloudResourceList(),
    projectApi.getProject(),
  ]);

  const resources = Array.isArray(cloudResourcesResponse)
    ? cloudResourcesResponse
    : (cloudResourcesResponse?.items ?? []);

  const projectNameById = new Map(
    projectsResponse.items.map((project) => [project.id, project.projectName]),
  );

  const serviceCounts = resources.reduce<Record<string, number>>(
    (acc, resource) => {
      const category = getStatCategory(resource.resourceType);
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const totalItems = resources.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = resources.slice(start, start + PAGE_SIZE);
  const end = Math.min(start + PAGE_SIZE, totalItems);

  return (
    <div className="space-y-6 p-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Cloud Resources
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalItems} resources across all projects and accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw />
            Sync
          </Button>
          <CloudResourceForm />
        </div>
      </div>

      {/* Service summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {serviceStats.map((service) => (
          <StatCard
            key={service.key}
            label={service.label}
            value={serviceCounts[service.key] ?? 0}
            labelClassName={service.className}
          />
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources, projects, owners..."
              className="pl-8"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {serviceStats.map((service) => (
                <SelectItem key={service.key} value={service.key}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <SlidersHorizontal />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {pageItems.length} of {totalItems} resources
          </span>

          <Button variant="outline">
            <Download />
            Export
          </Button>
        </div>
      </div>

      {/* Resources table */}
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Resource
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Service
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Type
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Region
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Project
              </TableHead>
              <TableHead className="h-11 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cost / mo
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No resources found
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((resource) => {
                const service = getServiceDisplay(resource.resourceType);
                const status = getStatusStyle(resource.resourceStatus);
                const projectName = resource.projectId
                  ? (projectNameById.get(resource.projectId) ?? 'Unknown')
                  : 'Unassigned';

                return (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {resource.resourceName ?? resource.resourceIdentifier}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {resource.awsAccount.accountName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={service.className}>
                        {service.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {resource.resourceType}
                    </TableCell>

                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-foreground">
                        <MapPin className="size-3 text-muted-foreground" />
                        {resource.region}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-foreground">
                      {projectName}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className={cn('gap-1.5', status.className)}>
                        <span
                          className={cn('size-1.5 rounded-full', status.dot)}
                        />
                        {resource.resourceStatus ?? 'Unknown'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      —
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
            Showing {totalItems === 0 ? 0 : start + 1}–{end} of {totalItems}{' '}
            resources
          </span>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isActive = currentPage === page;

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
