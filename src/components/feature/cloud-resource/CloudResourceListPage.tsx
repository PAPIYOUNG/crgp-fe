import { Download, MapPin } from 'lucide-react';
import CloudResourceForm from '@/components/feature/cloud-resource/CloudResourceForm';
import { CloudResourceDetailDialog } from '@/components/feature/cloud-resource/CloudResourceDetailDialog';
import { CloudResourcePagination } from '@/components/feature/cloud-resource/CloudResourcePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type {
  CloudResourceSortField,
  Environment,
  GetCloudResourcesQuery,
  ResourceSource,
  SortOrder,
} from '@/lib/api/api-type';
import { AwsAccountApi } from '@/lib/api/aws-account.api';
import { cloudResourceApi } from '@/lib/api/project-cloudresource.api';
import { projectApi } from '@/lib/api/project.api';
import { cn } from '@/lib/utils';
import {
  getServiceDisplay,
  getSourceDisplay,
  getStatusStyle,
  providerLabels,
  serviceStats,
} from '@/lib/utils/cloud-resource-display';
import { CloudResourceSearchParams } from '@/app/(main)/cloud-resources/page';
import { CloudResourceFilters } from '@/components/feature/cloud-resource/CloudResourceFilter';

const PAGE_SIZE = 8;

type CloudResourceListPageProps = {
  searchParams: CloudResourceSearchParams;
};

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function parseBoolean(value: string | undefined) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

// Manual resources store their monthly cost inside `configuration.monthlyCost`
// (set on CloudResourceForm); AWS-synced resources have no per-resource cost yet.
function getMonthlyCost(
  configuration: Record<string, unknown> | null,
): number | null {
  const value = configuration?.monthlyCost;

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const amount = Number(value);

  return Number.isFinite(amount) ? amount : null;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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
}: CloudResourceListPageProps) {
  const params = searchParams;

  const query: GetCloudResourcesQuery = {
    page: parsePositiveInteger(params.page, 1),

    limit: parsePositiveInteger(params.limit, PAGE_SIZE),

    search: params.search,

    awsAccountId: params.awsAccountId,

    projectId: params.projectId,

    ownerId: params.ownerId,

    resourceType: params.resourceType,

    region: params.region,

    source: params.source as ResourceSource | undefined,

    environment: params.environment as Environment | undefined,

    isDeleted: parseBoolean(params.isDeleted),

    unassigned: parseBoolean(params.unassigned),

    sortBy:
      (params.sortBy as CloudResourceSortField | undefined) ?? 'createdAt',

    order: (params.order as SortOrder | undefined) ?? 'desc',
  };

  const [response, awsAccountsResponse, projectsResponse] = await Promise.all([
    cloudResourceApi.getCloudResourceList(query),
    AwsAccountApi.getAwsAccountList(),
    projectApi.getProject({ limit: 100 }),
  ]);

  const resources = response.items;

  const awsAccounts = awsAccountsResponse.items
    .filter((account) => account.isActive)
    .map((account) => ({
      id: account.id,
      awsAccountId: account.awsAccountId,
      accountName: account.accountName,
    }));

  const projects = projectsResponse.items.map((project) => ({
    id: project.id,
    projectName: project.projectName,
  }));

  const {
    page: currentPage,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = response.pagination;

  /*
   * Backend แบ่งหน้ามาให้แล้ว
   * ห้าม resources.slice() ซ้ำ
   */
  const pageItems = resources;

  const start = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;

  const end = Math.min(currentPage * limit, totalItems);

  //รวม summarize มาจาก be เลยจ้า
  const serviceCounts = response.summary;

  return (
    <div className="space-y-6 p-6">
      {/* Heading */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Cloud Resources
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {totalItems} resources across all projects and accounts
          </p>
        </div>

        <CloudResourceForm awsAccounts={awsAccounts} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <CloudResourceFilters />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {pageItems.length} of {totalItems} resources
          </span>

          <Button type="button" variant="outline">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Resource
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cloud-Sync/Manual
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cloud-Account
              </TableHead>

              <TableHead className="h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Project
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
                  colSpan={9}
                  className="h-32 text-center text-muted-foreground"
                >
                  No resources match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((resource) => {
                const service = getServiceDisplay(resource.resourceType);

                const source = getSourceDisplay(resource.source);

                const status = getStatusStyle(resource.resourceStatus);

                const monthlyCost = getMonthlyCost(resource.configuration);

                return (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <CloudResourceDetailDialog
                        resource={resource}
                        projects={projects}
                      />
                    </TableCell>

                    <TableCell>
                      <Badge className={cn('gap-1.5', source.className)}>
                        {source.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-foreground">
                      {resource.awsAccount?.accountName ??
                        providerLabels[resource.provider] ??
                        resource.provider}
                    </TableCell>

                    <TableCell className="text-sm text-foreground">
                      {resource.project ? (
                        resource.project.projectName
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={service.className}>
                        {service.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-80 font-mono text-xs text-muted-foreground">
                      <span className="break-all">{resource.resourceType}</span>
                    </TableCell>

                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-foreground">
                        <MapPin className="size-3 text-muted-foreground" />

                        {resource.region ?? 'Global'}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className={cn('gap-1.5', status.className)}>
                        <span
                          className={cn('size-1.5 rounded-full', status.dot)}
                        />

                        {resource.resourceStatus ?? 'Unknown'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-foreground">
                      {monthlyCost !== null ? (
                        formatMoney(monthlyCost)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {start}–{end} of {totalItems} resources
          </span>

          <CloudResourcePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      </Card>
    </div>
  );
}
