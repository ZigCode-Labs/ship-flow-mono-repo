'use client';

import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RMRegisterHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export function RMRegisterHeader({
  searchQuery,
  onSearchChange,
  onCreateClick,
}: RMRegisterHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-7 py-7">
      {/* Title Row */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold leading-8 text-gray-950">Raw Material Register</h1>
        <p className="mt-1 text-base text-slate-600">
          View and manage raw material items used in production.
        </p>
      </div>

      {/* Search and Button Row */}
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
        <Button
          onClick={onCreateClick}
          className="h-11 gap-3 rounded-md bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-5" />
          Add Raw Material
        </Button>
      </div>
    </div>
  );
}
