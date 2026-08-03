'use client';

import { useEffect, useState, useTransition } from 'react';
import { ListFilter, RotateCcw, Search } from 'lucide-react';
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

import {
  departmentOptions,
  projectSortOptions,
  projectStatusOptions,
} from '@/lib/constants/project';

const ALL_VALUE = 'ALL';

export function ProjectFilters() {
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

    /*
     * เมื่อเปลี่ยน filter หรือ search
     * ให้กลับหน้า 1 เสมอ ป้องกันกรณีเดิมอยู่หน้า 4
     * แต่ผลหลัง filter มีเพียงหน้าเดียว
     */
    params.set('page', '1');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateSearchParams({
      search: search.trim() || null,
    });
  }

  function handleSortChange(value: string) {
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

  const businessDepartment =
    searchParams.get('businessDepartment') ?? ALL_VALUE;

  const technicalDepartment =
    searchParams.get('technicalDepartment') ?? ALL_VALUE;

  const status = searchParams.get('status') ?? ALL_VALUE;

  const sortBy = searchParams.get('sortBy') ?? 'updatedAt';
  const order = searchParams.get('order') ?? 'desc';
  const sortValue = `${sortBy}:${order}`;

  const hasFilters =
    Boolean(searchParams.get('search')) ||
    Boolean(searchParams.get('businessDepartment')) ||
    Boolean(searchParams.get('technicalDepartment')) ||
    Boolean(searchParams.get('status')) ||
    Boolean(searchParams.get('sortBy')) ||
    Boolean(searchParams.get('order'));

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search project name or description..."
            className="pl-9"
            disabled={isPending}
          />
        </form>

        <Select
          value={status}
          onValueChange={(value) =>
            updateSearchParams({
              status: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full xl:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>

            {projectStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortValue}
          onValueChange={handleSortChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full xl:w-50">
            <SelectValue placeholder="Sort projects" />
          </SelectTrigger>

          <SelectContent>
            {projectSortOptions.map((option) => {
              const value = `${option.sortBy}:${option.order}`;

              return (
                <SelectItem key={value} value={value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ListFilter className="size-4" />
          Filters
        </div>

        <Select
          value={businessDepartment}
          onValueChange={(value) =>
            updateSearchParams({
              businessDepartment: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full xl:w-[220px]">
            <SelectValue placeholder="Business owner" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All business departments</SelectItem>

            {departmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={technicalDepartment}
          onValueChange={(value) =>
            updateSearchParams({
              technicalDepartment: value === ALL_VALUE ? null : value,
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-full xl:w-[220px]">
            <SelectValue placeholder="Technical owner" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_VALUE}>All technical departments</SelectItem>

            {departmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        )}
      </div>
    </section>
  );
}
