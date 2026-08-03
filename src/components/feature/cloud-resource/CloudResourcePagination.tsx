'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { usePathname, useSearchParams } from 'next/navigation';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

type CloudResourcePaginationProps = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function CloudResourcePagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: CloudResourcePaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function createPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', String(page));

    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <Pagination className="mx-0 w-auto justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href={createPageUrl(Math.max(currentPage - 1, 1))}
            aria-label="Go to previous page"
            aria-disabled={!hasPreviousPage}
            tabIndex={!hasPreviousPage ? -1 : undefined}
            className={
              !hasPreviousPage ? 'pointer-events-none opacity-50' : undefined
            }
          >
            <ChevronLeft className="size-4" />

            <span className="sr-only">Previous page</span>
          </PaginationLink>
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createPageUrl(page)}
              isActive={page === currentPage}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink
            href={createPageUrl(Math.min(currentPage + 1, totalPages))}
            aria-label="Go to next page"
            aria-disabled={!hasNextPage}
            tabIndex={!hasNextPage ? -1 : undefined}
            className={
              !hasNextPage ? 'pointer-events-none opacity-50' : undefined
            }
          >
            <ChevronRight className="size-4" />

            <span className="sr-only">Next page</span>
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
