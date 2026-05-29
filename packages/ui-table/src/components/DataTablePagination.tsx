'use client';

import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { cn } from '../utils';

const PAGE_SIZES = [10, 20, 50, 100];

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
}

export function DataTablePagination<TData>({ table, className }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-1 py-3 text-sm text-gray-600',
        className,
      )}
    >
      <span className="shrink-0">
        {totalRows} row{totalRows !== 1 ? 's' : ''}
      </span>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 shrink-0">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded border border-gray-200 bg-gray-50 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="shrink-0">
          Page {pageIndex + 1} of {pageCount || 1}
        </span>

        <div className="flex items-center gap-1">
          <NavButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            {'«'}
          </NavButton>
          <NavButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            {'‹'}
          </NavButton>
          <NavButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            {'›'}
          </NavButton>
          <NavButton
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            {'»'}
          </NavButton>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  children,
  'aria-label': ariaLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
    >
      {children}
    </button>
  );
}
