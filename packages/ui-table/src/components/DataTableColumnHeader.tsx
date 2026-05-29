'use client';

import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { cn } from '../utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn('text-sm font-medium', className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors',
        className,
      )}
    >
      {title}
      <span className="flex flex-col leading-none" aria-hidden="true">
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          className={cn('fill-current', sorted === 'asc' ? 'opacity-100' : 'opacity-30')}
        >
          <path d="M4 0L8 5H0L4 0Z" />
        </svg>
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          className={cn('fill-current mt-0.5', sorted === 'desc' ? 'opacity-100' : 'opacity-30')}
        >
          <path d="M4 5L0 0H8L4 5Z" />
        </svg>
      </span>
    </button>
  );
}
