'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItemRegisterEmptyStateProps {
  onCreateClick: () => void;
}

export function ItemRegisterEmptyState({ onCreateClick }: ItemRegisterEmptyStateProps) {
  return (
    <div className="flex min-h-58 flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-normal text-slate-800">No production items found</h3>
        <p className="mb-6 text-base text-slate-700">
          Create your first production item to get started.
        </p>
        <Button
          onClick={onCreateClick}
          className="h-11 gap-3 rounded-md bg-blue-600 px-6 text-base font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-5" />
          Create New Item
        </Button>
      </div>
    </div>
  );
}
