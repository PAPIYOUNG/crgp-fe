import { Download, MapPin } from 'lucide-react';

import CloudResourceForm from '@/components/feature/cloud-resource/CloudResourceForm';

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
import { cn } from '@/lib/utils';
import { CloudResourceSearchParams } from '@/app/(main)/cloud-resources/page';
import { CloudResourceFilters } from '@/components/feature/cloud-resource/CloudResourceFilter';

const PAGE_SIZE = 8;

type CloudResourceListPageProps = {
  searchParams: CloudResourceSearchParams;
};

const serviceStats = [
  {
    key: 'EC2',
    label: 'EC2',
    className: 'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'RDS',
    label: 'RDS',
    className: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'S3',
    label: 'S3',
    className: 'text-green-600 dark:text-green-400',
  },
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
  {
    key: 'OTHER',
    label: 'Other',
    className: 'text-foreground',
  },
] as const;

const providerLabels: Record<string, string> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  GCP: 'Google Cloud',
  ON_PREM: 'On-Premises',
  OTHER: 'Other',
};

const serviceLabels: Record<string, string> = {
  EC2: 'EC2',
  RDS: 'RDS',
  S3: 'S3',
  LAMBDA: 'Lambda',
  EKS: 'EKS',
  NETWORKING: 'Networking',
  ELASTICLOADBALANCING: 'Load Balancer',
  ELASTICLOADBALANCINGV2: 'Load Balancer',
  WAF: 'WAF',
  WAFV2: 'WAF',
  CLOUDFRONT: 'CloudFront',
  ROUTE53RESOLVER: 'Route53 Resolver',
  CASSANDRA: 'Cassandra',
  KMS: 'KMS',
  IAM: 'IAM',
  ATHENA: 'Athena',
};

const serviceBadgeStyles: Record<string, string> = {
  EC2: 'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-400',

  RDS: 'border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-blue-400',

  S3: 'border-green-200 text-green-700 dark:border-green-500/30 dark:text-green-400',

  LAMBDA:
    'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-400',

  EKS: 'border-indigo-200 text-indigo-700 dark:border-indigo-500/30 dark:text-indigo-400',

  NETWORKING:
    'border-purple-200 text-purple-700 dark:border-purple-500/30 dark:text-purple-400',

  CASSANDRA:
    'border-violet-200 text-violet-700 dark:border-violet-500/30 dark:text-violet-400',

  KMS: 'border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-blue-400',

  IAM: 'border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400',

  ATHENA:
    'border-cyan-200 text-cyan-700 dark:border-cyan-500/30 dark:text-cyan-400',

  LOAD_BALANCER:
    'border-cyan-200 text-cyan-700 dark:border-cyan-500/30 dark:text-cyan-400',

  WAF: 'border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-400',

  CDN: 'border-violet-200 text-violet-700 dark:border-violet-500/30 dark:text-violet-400',
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

function getServiceSegment(resourceType: string) {
  return resourceType.split('::')[1]?.toUpperCase() ?? 'OTHER';
}

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

    case 'AWS::ElasticLoadBalancing::LoadBalancer':
    case 'AWS::ElasticLoadBalancingV2::LoadBalancer':
      return 'LOAD_BALANCER';

    case 'AWS::WAF::WebACL':
    case 'AWS::WAFv2::WebACL':
      return 'WAF';

    case 'AWS::CloudFront::Distribution':
      return 'CDN';

    case 'AWS::EC2::RouteTable':
    case 'AWS::EC2::NetworkAcl':
    case 'AWS::EC2::SecurityGroup':
    case 'AWS::EC2::Subnet':
    case 'AWS::EC2::VPC':
    case 'AWS::EC2::InternetGateway':
    case 'AWS::EC2::NatGateway':
    case 'AWS::EC2::SubnetRouteTableAssociation':
    case 'AWS::Route53Resolver::ResolverRule':
    case 'AWS::Route53Resolver::ResolverRuleAssociation':
      return 'NETWORKING';

    default:
      return 'OTHER';
  }
}

function getServiceDisplay(resourceType: string) {
  const category = getStatCategory(resourceType);

  const categoryLabel = serviceStats.find(
    (stat) => stat.key === category,
  )?.label;

  if (category !== 'OTHER' && categoryLabel) {
    return {
      label: categoryLabel,

      className:
        serviceBadgeStyles[category] ?? 'border-border text-muted-foreground',
    };
  }

  const segment = getServiceSegment(resourceType);

  return {
    label: serviceLabels[segment] ?? segment,

    className:
      serviceBadgeStyles[segment] ?? 'border-border text-muted-foreground',
  };
}

function getStatusStyle(status: string | null) {
  const normalized = status?.toLowerCase() ?? '';

  if (
    ['running', 'available', 'active'].some((item) => normalized.includes(item))
  ) {
    return {
      dot: 'bg-green-500',

      className:
        'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    };
  }

  if (
    ['stopped', 'pending', 'stopping'].some((item) => normalized.includes(item))
  ) {
    return {
      dot: 'bg-amber-500',

      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    };
  }

  if (
    ['terminated', 'error', 'failed', 'deleted'].some((item) =>
      normalized.includes(item),
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

  const [response, awsAccountsResponse] = await Promise.all([
    cloudResourceApi.getCloudResourceList(query),
    AwsAccountApi.getAwsAccountList(),
  ]);

  const resources = response.items;

  const awsAccounts = awsAccountsResponse.items
    .filter((account) => account.isActive)
    .map((account) => ({
      id: account.id,
      awsAccountId: account.awsAccountId,
      accountName: account.accountName,
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
                  No resources match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((resource) => {
                const service = getServiceDisplay(resource.resourceType);

                const status = getStatusStyle(resource.resourceStatus);

                return (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {resource.resourceName ?? resource.resourceIdentifier}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {resource.awsAccount?.accountName ??
                            (providerLabels[resource.provider] ??
                              resource.provider)}
                        </span>
                      </div>
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

                    <TableCell className="text-sm text-foreground">
                      {resource.projectId ? 'Assigned' : 'Unassigned'}
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
