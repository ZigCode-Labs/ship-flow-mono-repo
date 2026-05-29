'use client';

import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { cn } from '../utils';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: string;
  searchPlaceholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = 'Search...',
  className,
  children,
}: DataTableToolbarProps<TData>) {
  const column = searchColumn ? table.getColumn(searchColumn) : undefined;
  const searchValue = (column?.getFilterValue() as string) ?? '';

  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      {column && (
        <input
          type="search"
          value={searchValue}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-64 rounded-[5px] border border-gray-200 bg-gray-50 px-3 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      )}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}
