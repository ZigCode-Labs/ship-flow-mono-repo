'use client';

import { Camera, Info, SquarePen, Tag, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

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

interface RMRegisterViewModalProps {
  material: RawMaterial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (material: RawMaterial) => void;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

export function RMRegisterViewModal({
  material,
  open,
  onOpenChange,
  onEdit,
}: RMRegisterViewModalProps) {
  if (!material) return null;

  const unitLabel = unitLabels[material.unit] ?? material.unit.toUpperCase();

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(material);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl border-gray-200 p-0 sm:max-w-3xl [&>button.absolute]:hidden">
        <DialogTitle className="sr-only">
          {material.name} ({material.code})
        </DialogTitle>

        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge className="rounded-md border-0 bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-blue-600">
              {material.code}
            </Badge>
            <h2 className="truncate text-lg font-bold text-gray-950">{material.name}</h2>
            <Badge className="rounded-md border-0 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-100">
              Raw Material
            </Badge>
            <Badge className="rounded-md border-0 bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100">
              Active
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleEdit}
              className="h-9 gap-2 rounded-md border-gray-200 px-3 text-sm font-semibold text-gray-900"
            >
              <SquarePen className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="size-9 text-gray-500 hover:bg-gray-100"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Camera className="size-4 text-gray-500" />
                Product Images
              </h3>
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-200 bg-gray-50">
                {material.imageUrl ? (
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                    <Camera className="size-8" strokeWidth={1.5} />
                    <span>No image</span>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Info className="size-4 text-gray-500" />
                Quick Info
              </h3>
              <dl className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900">Raw Material</dd>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500">Unit</dt>
                  <dd className="font-medium text-gray-900">{unitLabel}</dd>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500">Source</dt>
                  <dd className="font-medium text-gray-900">Outsourced</dd>
                </div>
              </dl>
            </section>
          </div>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Tag className="size-4 text-gray-500" />
              Identity
            </h3>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <DetailField label="Item Code" value={material.code} />
              <DetailField label="Type" value="Raw Material" />
              <DetailField label="Unit" value={unitLabel} />
              <DetailField label="Production Source" value="Outsourced" />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
