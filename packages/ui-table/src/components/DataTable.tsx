'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import { cn } from '../utils';

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Column id to enable global search on */
  searchColumn?: string;
  searchPlaceholder?: string;
  /** Show pagination controls */
  paginated?: boolean;
  /** Default page size */
  pageSize?: number;
  /** Show a toolbar above the table */
  toolbar?: boolean;
  /** Extra content rendered inside the toolbar (right side) */
  toolbarContent?: React.ReactNode;
  /** Render content when data is empty */
  emptyState?: React.ReactNode;
  /** Enable row selection checkboxes */
  selectable?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  className?: string;
  tableClassName?: string;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchColumn,
  searchPlaceholder,
  paginated = true,
  pageSize = 10,
  toolbar = true,
  toolbarContent,
  emptyState,
  selectable = false,
  onRowSelectionChange,
  className,
  tableClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!selectable) return columns;
    const selectionCol: ColumnDef<TData, TValue> = {
      id: '__select__',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all"
          className="h-4 w-4 rounded border border-gray-300 accent-blue-600 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
          className="h-4 w-4 rounded border border-gray-300 accent-blue-600 cursor-pointer disabled:opacity-50"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };
    return [selectionCol, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (onRowSelectionChange) {
          const selectedRows = Object.keys(next)
            .filter((k) => next[k])
            .map((k) => data[parseInt(k, 10)])
            .filter(Boolean);
          onRowSelectionChange(selectedRows);
        }
        return next;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginated && { getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {toolbar && (searchColumn || toolbarContent) && (
        <DataTableToolbar
          table={table}
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
        >
          {toolbarContent}
        </DataTableToolbar>
      )}

      <div className="relative w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className={cn('w-full caption-bottom text-sm', tableClassName)}>
          <thead className="border-b border-gray-200 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className="h-12 px-3 text-left align-middle font-medium whitespace-nowrap text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50/60 data-[state=selected]:bg-blue-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-3 align-middle whitespace-nowrap border-r border-gray-200 last:border-r-0"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={allColumns.length} className="h-32 text-center text-sm text-gray-400">
                  {emptyState ?? 'No results found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginated && <DataTablePagination table={table} className="border-t border-gray-200 pt-3" />}
    </div>
  );
}
