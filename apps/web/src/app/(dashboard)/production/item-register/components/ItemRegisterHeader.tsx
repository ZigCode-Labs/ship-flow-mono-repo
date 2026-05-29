'use client';

import { Copy, Funnel, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ItemType, itemTypeOptions } from '../types';

interface ItemRegisterHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: ItemType;
  onTypeChange: (value: ItemType) => void;
  onImportClick: () => void;
  onCreateClick: () => void;
}

export function ItemRegisterHeader({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  onImportClick,
  onCreateClick,
}: ItemRegisterHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-7 py-7">
      {/* Title Row */}
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-8 text-gray-950">
            Production Item Register
          </h1>
          <p className="mt-1 max-w-3xl text-base leading-6 text-slate-700">
            Manage finished goods, raw materials, components, and sub-assemblies for production
            workflows.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            onClick={onImportClick}
            className="h-11 gap-3 rounded-md border-gray-200 px-5 text-base font-semibold text-gray-950 hover:bg-gray-50"
          >
            <Copy className="size-5" />
            Import from Main Item
          </Button>
          <Button
            onClick={onCreateClick}
            className="h-11 gap-3 rounded-md bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="size-5" />
            Create New
          </Button>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, code, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white py-2 pl-11 pr-4 text-base text-gray-900 transition-all placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Type Filter */}
        <Select value={selectedType} onValueChange={(value) => onTypeChange(value as ItemType)}>
          <SelectTrigger className="h-11 w-full rounded-lg border-gray-200 bg-white text-base sm:w-[202px]">
            <Funnel className="mr-4 size-5 text-gray-950" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {itemTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
