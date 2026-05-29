'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductionItem, itemTypeLabels } from '../types';

interface ItemRegisterTableProps {
  items: ProductionItem[];
  onItemClick?: (item: ProductionItem) => void;
}

export function ItemRegisterTable({ items, onItemClick }: ItemRegisterTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-[120px] font-semibold text-gray-700">Code</TableHead>
            <TableHead className="font-semibold text-gray-700">Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Description</TableHead>
            <TableHead className="w-[140px] font-semibold text-gray-700">Type</TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">Unit</TableHead>
            <TableHead className="w-[120px] font-semibold text-gray-700">Category</TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">Quantity</TableHead>
            <TableHead className="w-[120px] font-semibold text-gray-700">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <TableCell className="font-medium text-gray-900">{item.code}</TableCell>
              <TableCell className="text-gray-900">{item.name}</TableCell>
              <TableCell className="text-gray-600 max-w-xs truncate">
                {item.description || '-'}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {itemTypeLabels[item.type] || item.type}
                </span>
              </TableCell>
              <TableCell className="text-gray-600">{item.unit}</TableCell>
              <TableCell className="text-gray-600">{item.category || '-'}</TableCell>
              <TableCell className="text-gray-600">{item.quantity ?? '-'}</TableCell>
              <TableCell className="text-gray-600 capitalize">
                {item.productionSource?.replace('_', '-') || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
