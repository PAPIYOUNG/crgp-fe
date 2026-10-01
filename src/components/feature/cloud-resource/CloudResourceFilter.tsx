'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';

import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_VALUE = 'ALL';

const resourceTypeOptions = [
  {
    value: 'AWS::EC2::Instance',
    label: 'EC2 Instance',
  },
  {
    value: 'AWS::EC2::VPC',
    label: 'VPC',
  },
  {
    value: 'AWS::EC2::Subnet',
    label: 'Subnet',
  },
  {
    value: 'AWS::EC2::SecurityGroup',
    label: 'Security Group',
  },
  {
    value: 'AWS::EC2::RouteTable',
    label: 'Route Table',
  },
  {
    value: 'AWS::S3::Bucket',
    label: 'S3 Bucket',
  },
  {
    value: 'AWS::RDS::DBInstance',
    label: 'RDS Instance',
  },
  {
    value: 'AWS::RDS::DBCluster',
    label: 'RDS Cluster',
  },
  {
    value: 'AWS::Lambda::Function',
    label: 'Lambda Function',
  },
  {
    value: 'AWS::EKS::Cluster',
    label: 'EKS Cluster',
  },
  {
    value: 'AWS::IAM::User',
    label: 'IAM User',
  },
  {
    value: 'AWS::IAM::Role',
    label: 'IAM Role',
  },
  {
    value: 'AWS::KMS::Key',
    label: 'KMS Key',
  },
  {
    value: 'AWS::KMS::Alias',
    label: 'KMS Alias',
  },
  {
    value: 'AWS::Cassandra::Keyspace',
    label: 'Cassandra Keyspace',
  },
] as const;

const environmentOptions = ['DEV', 'UAT', 'STAGING', 'PRODUCTION'] as const;

const regionOptions = [
  { value: 'us-east-1', label: 'us-east-1' },
  { value: 'us-west-2', label: 'us-west-2' },
  { value: 'ap-southeast-1', label: 'ap-southeast-1' },
  { value: 'global', label: 'global' },
] as const;

const sourceOptions = [
  {
    value: 'AWS_CONFIG',
    label: 'AWS Config',
  },
  {
    value: 'MANUAL',
    label: 'Manual',
  },
] as const;

const sortOptions = [
  {
    value: 'createdAt:desc',
    label: 'Newest created',
  },
  {
    value: 'createdAt:asc',
    label: 'Oldest created',
  },
  {
    value: 'updatedAt:desc',
    label: 'Recently updated',
  },
  {
    value: 'resourceName:asc',
    label: 'Resource name A–Z',
  },
  {
    value: 'resourceName:desc',
    label: 'Resource name Z–A',
  },
  {
    value: 'resourceType:asc',
    label: 'Resource type A–Z',
  },
  {
    value: 'region:asc',
    label: 'Region A–Z',
  },
] as const;

const resourceTypeItems: Record<string, string> = {
  [ALL_VALUE]: 'All resource types',
  ...Object.fromEntries(
    resourceTypeOptions.map((option) => [option.value, option.label]),
  ),
};

const regionItems: Record<string, string> = {
  [ALL_VALUE]: 'All regions',
  ...Object.fromEntries(regionOptions.map((option) => [option.value, option.label])),
};

const sourceItems: Record<string, string> = {
  [ALL_VALUE]: 'All sources',
  ...Object.fromEntries(sourceOptions.map((option) => [option.value, option.label])),
};

const environmentItems: Record<string, string> = {
  [ALL_VALUE]: 'All environments',
  ...Object.fromEntries(environmentOptions.map((value) => [value, value])),
};

const assignmentItems: Record<string, string> = {
  [ALL_VALUE]: 'All assignments',
  UNASSIGNED: 'Unassigned only',
};

const sortItems: Record<string, string> = Object.fromEntries(
  sortOptions.map((option) => [option.value, option.label]),
);

export function CloudResourceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const searchFromUrl = searchParams.get('search') ?? '';

  const [search, setSearch] = useState(searchFromUrl);

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  function updateSearchParams(values: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(values)) {
      if (!value || value === ALL_VALUE) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // เมื่อเปลี่ยน filter ต้องกลับหน้าแรก
    params.set('page', '1');

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateSearchParams({
      search: search.trim() || null,
    });
  }

  function handleSortChange(value: string | null) {
    if (!value) return;

    const [sortBy, order] = value.split(':');

    updateSearchParams({
      sortBy,
      order,
    });
  }

  function handleReset() {
    setSearch('');

    startTransition(() => {
      router.replace(pathname);
    });
  }

  const resourceType = searchParams.get('resourceType') ?? ALL_VALUE;

  const region = searchParams.get('region') ?? ALL_VALUE;

  const source = searchParams.get('source') ?? ALL_VALUE;

  const environment = searchParams.get('environment') ?? ALL_VALUE;

  const assignment =
    searchParams.get('unassigned') === 'true' ? 'UNASSIGNED' : ALL_VALUE;

  const sortBy = searchParams.get('sortBy') ?? 'createdAt';

  const order = searchParams.get('order') ?? 'desc';

  const sortValue = `${sortBy}:${order}`;

  const hasFilters =
    Boolean(searchParams.get('search')) ||
    Boolean(searchParams.get('resourceType')) ||
    Boolean(searchParams.get('region')) ||
    Boolean(searchParams.get('source')) ||
    Boolean(searchParams.get('environment')) ||
    Boolean(searchParams.get('projectId')) ||
    Boolean(searchParams.get('unassigned')) ||
    Boolean(searchParams.get('sortBy')) ||
    Boolean(searchParams.get('order'));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, identifier, or type..."
              className="pl-8"
              disabled={isPending}
            />
          </div>

          <Button type="submit" variant="outline" disabled={isPending}>
            <Search className="size-4" />
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="size-4" />
          Filters
        </div>

        <Select
          items={resourceTypeItems}
          value={resourceType}
          onValueChange={(value) =>
            updateSearchParams({
              resourceType: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full xl:w-56">
            <SelectValue placeholder="All resource types" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All resource types</SelectItem>

            {resourceTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={regionItems}
          value={region}
          onValueChange={(value) =>
            updateSearchParams({
              region: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All regions</SelectItem>

            {regionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={sourceItems}
          value={source}
          onValueChange={(value) =>
            updateSearchParams({
              source: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All sources</SelectItem>

            {sourceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={environmentItems}
          value={environment}
          onValueChange={(value) =>
            updateSearchParams({
              environment: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All environments" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All environments</SelectItem>

            {environmentOptions.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={assignmentItems}
          value={assignment}
          onValueChange={(value) =>
            updateSearchParams({
              unassigned: value === 'UNASSIGNED' ? 'true' : null,
              projectId: null,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All assignments" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All assignments</SelectItem>

            <SelectItem value="UNASSIGNED">Unassigned only</SelectItem>
          </SelectContent>
        </Select>

        <Select
          items={sortItems}
          value={sortValue}
          onValueChange={handleSortChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full xl:w-52">
            <SelectValue placeholder="Sort resources" />
          </SelectTrigger>

          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={isPending}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
