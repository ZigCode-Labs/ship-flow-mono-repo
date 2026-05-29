export { DataTable } from './components/DataTable';
export { DataTableColumnHeader } from './components/DataTableColumnHeader';
export { DataTablePagination } from './components/DataTablePagination';
export { DataTableToolbar } from './components/DataTableToolbar';

export type { DataTableProps } from './components/DataTable';

// Re-export TanStack Table helpers consumers need to define columns
export {
  createColumnHelper,
  type ColumnDef,
  type Row,
  type Table,
  type Column,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table';
