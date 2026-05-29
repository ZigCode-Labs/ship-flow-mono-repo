'use client';

import { Plus, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LineItem } from '../types';

interface LineItemsSectionProps {
  lineItems: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void;
}

const gstOptions = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
];

// SINGLE shared grid template - EXACT SAME for header, body, and empty state
const GRID_TEMPLATE = '130px 240px 100px 80px 80px 100px 80px 90px 140px 70px';

// Input styling - compact ERP appearance
const inputClassName =
  'h-[40px] w-full rounded-[10px] border border-gray-200 bg-white px-2 text-sm box-border focus-visible:ring-1 focus-visible:ring-blue-500/30';

// Select styling - compact ERP appearance
const selectTriggerClassName =
  'h-[40px] w-full rounded-[10px] border border-gray-200 bg-white px-2 text-sm box-border focus:ring-1 focus:ring-blue-500/30';

// Header cell styling
const headerCellClass = 'text-[14px] font-medium text-gray-600 px-2 flex items-center';

// Body cell styling
const bodyCellClass = 'px-1 flex items-center';

export function LineItemsSection({
  lineItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: LineItemsSectionProps) {
  return (
    <div className="w-full rounded-[16px] border border-gray-200 bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex flex-row items-center justify-between px-6 py-4 pb-3">
        <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="h-9 gap-1.5 rounded-lg border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Table Wrapper - ONLY this scrolls horizontally */}
      <div className="overflow-x-auto overflow-y-hidden w-full">
        {/* Table Inner - Fixed min-width, moves together as one unit */}
        <div style={{ minWidth: '1200px' }}>
          {/* Header Row - Uses SAME grid template */}
          <div
            className="grid border-b border-gray-200 bg-gray-50"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            <div className={`${headerCellClass} justify-start`}>Item Code</div>
            <div className={`${headerCellClass} justify-start`}>Item Name</div>
            <div className={`${headerCellClass} justify-start`}>HSN</div>
            <div className={`${headerCellClass} justify-center`}>Qty</div>
            <div className={`${headerCellClass} justify-center`}>Unit</div>
            <div className={`${headerCellClass} justify-center`}>Rate</div>
            <div className={`${headerCellClass} justify-center`}>Disc%</div>
            <div className={`${headerCellClass} justify-center`}>GST%</div>
            <div className={`${headerCellClass} justify-end`}>Amount</div>
            <div className={`${headerCellClass} justify-center`}></div>
          </div>

          {/* Body Rows Container */}
          <div className="divide-y divide-gray-100">
            {lineItems.length === 0 ? (
              /* Empty State - Uses SAME grid template for alignment */
              <div className="grid items-center" style={{ gridTemplateColumns: GRID_TEMPLATE }}>
                <div className="col-span-10 px-3 py-10">
                  <span className="text-sm text-gray-400">
                    No items added. Click &quot;Add Item&quot; to add line items.
                  </span>
                </div>
              </div>
            ) : (
              lineItems.map((item) => (
                /* Data Row - Uses SAME grid template */
                <div
                  key={item.id}
                  className="grid items-center hover:bg-gray-50/50"
                  style={{ gridTemplateColumns: GRID_TEMPLATE }}
                >
                  {/* Item Code */}
                  <div className={bodyCellClass}>
                    <Select
                      value={item.itemCode || 'placeholder'}
                      onValueChange={(value) =>
                        onUpdateItem(item.id, 'itemCode', value === 'placeholder' ? '' : value)
                      }
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder">Select</SelectItem>
                        <SelectItem value="ITEM001">ITEM001</SelectItem>
                        <SelectItem value="ITEM002">ITEM002</SelectItem>
                        <SelectItem value="ITEM003">ITEM003</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Item Name */}
                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => onUpdateItem(item.id, 'itemName', e.target.value)}
                      placeholder="Item name"
                      className={inputClassName}
                    />
                  </div>

                  {/* HSN */}
                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => onUpdateItem(item.id, 'hsn', e.target.value)}
                      placeholder="HSN"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Qty */}
                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Unit */}
                  <div className={bodyCellClass}>
                    <Input
                      type="text"
                      value={item.unit}
                      onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                      placeholder="PC"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Rate */}
                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => onUpdateItem(item.id, 'rate', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* Disc% */}
                  <div className={bodyCellClass}>
                    <Input
                      type="number"
                      value={item.discount}
                      onChange={(e) => onUpdateItem(item.id, 'discount', Number(e.target.value))}
                      min="0"
                      max="100"
                      className={`${inputClassName} text-center`}
                    />
                  </div>

                  {/* GST% */}
                  <div className={bodyCellClass}>
                    <Select
                      value={item.gst.toString()}
                      onValueChange={(value) => onUpdateItem(item.id, 'gst', Number(value))}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue placeholder="0%" />
                      </SelectTrigger>
                      <SelectContent>
                        {gstOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className={`${bodyCellClass} justify-end gap-2`}>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.amount.toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-[8px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className={`${bodyCellClass} justify-center`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-7 w-7 rounded-[8px] text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
