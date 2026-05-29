'use client';

import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CustomerOption } from '@/store/domesticBuyers';

interface CustomerSelectorDropdownProps {
  value: string;
  onChange: (value: string) => void;
  customerOptions: CustomerOption[];
  isLoading: boolean;
  error: string | null;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable buyer-selector dropdown. Handles all UI states (loading, error,
 * empty, populated) so individual forms don't need to repeat this logic.
 *
 * Used by: Tax Invoice, Proforma, Credit Notes, and any future module that
 * needs to select a domestic buyer.
 */
export function CustomerSelectorDropdown({
  value,
  onChange,
  customerOptions,
  isLoading,
  error,
  placeholder = 'Select a domestic buyer',
  className,
}: CustomerSelectorDropdownProps) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className={`rounded-sm text-gray-500${className ? ` ${className}` : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              Loading buyers...
            </SelectItem>
          ) : error ? (
            <SelectItem value="__error__" disabled>
              Failed to load buyers
            </SelectItem>
          ) : customerOptions.length > 0 ? (
            customerOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__empty__" disabled>
              No active buyers found
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
