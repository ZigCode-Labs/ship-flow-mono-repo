'use client';

import { Eye, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { RawMaterial } from '../types';

const unitLabels: Record<string, string> = {
  pcs: 'PCS',
  kg: 'KG',
  mtr: 'MTR',
  set: 'SET',
  box: 'BOX',
  ltr: 'LTR',
  sqft: 'SQFT',
};

function formatOptionalText(value?: string | null): string {
  if (!value?.trim()) return '—';
  return value.trim();
}

function formatOptionalNumber(value?: number | null): string {
  if (value === undefined || value === null || value === 0) return '—';
  return String(value);
}

function formatStandardRate(rate?: number | null): string {
  if (rate === undefined || rate === null || rate === 0) return '—';
  return rate.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

interface RMRegisterTableProps {
  materials: RawMaterial[];
  onView?: (material: RawMaterial) => void;
  onEdit?: (material: RawMaterial) => void;
  onDelete?: (material: RawMaterial) => void;
}

export function RMRegisterTable({ materials, onView, onEdit, onDelete }: RMRegisterTableProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-14" />
            <TableHead className="w-[120px] font-semibold text-gray-700">Code</TableHead>
            <TableHead className="font-semibold text-gray-700">Name</TableHead>
            <TableHead className="w-[140px] font-semibold text-gray-700">Category</TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">Unit</TableHead>
            <TableHead className="w-[120px] font-semibold text-gray-700">Qty on Hand</TableHead>
            <TableHead className="w-[120px] font-semibold text-gray-700">Std. Rate</TableHead>
            <TableHead className="w-[120px] text-right font-semibold text-gray-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id} className="border-gray-200 hover:bg-gray-50/80">
              <TableCell className="py-3">
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                  {material.imageUrl ? (
                    <img
                      src={material.imageUrl}
                      alt={material.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-5 text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium text-gray-900">{material.code}</TableCell>
              <TableCell className="text-gray-900">{material.name}</TableCell>
              <TableCell className="text-gray-600">
                {formatOptionalText(material.category)}
              </TableCell>
              <TableCell className="text-gray-600">
                {unitLabels[material.unit] ?? material.unit.toUpperCase()}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatOptionalNumber(material.qtyOnHand)}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatStandardRate(material.standardRate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-gray-500 hover:text-blue-600"
                    aria-label={`View ${material.name}`}
                    onClick={() => onView?.(material)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-gray-500 hover:text-blue-600"
                    aria-label={`Edit ${material.name}`}
                    onClick={() => onEdit?.(material)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${material.name}`}
                    onClick={() => onDelete?.(material)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
