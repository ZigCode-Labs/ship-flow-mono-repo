'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

type DigitsSelectProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
};

export function DigitsSelect({
  value,
  onChange,
  className = 'h-10 rounded-lg border border-gray-200 bg-white text-sm',
  min = 3,
  max = 8,
}: DigitsSelectProps) {
  // Generate options from min to max
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <Select value={String(value)} onValueChange={(val) => onChange(parseInt(val, 10))}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
