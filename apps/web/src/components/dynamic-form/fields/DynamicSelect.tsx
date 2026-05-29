'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectFieldConfig } from '../types';

interface DynamicSelectProps {
  config: SelectFieldConfig;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

export function DynamicSelect({ config, value, onChange, error }: DynamicSelectProps) {
  const handleChange = (newValue: string) => {
    const selectedOption = config.options.find((opt) => opt.value === newValue);
    onChange?.(config.multiple ? [newValue] : (selectedOption?.value ?? newValue));
  };

  return (
    <div className={`space-y-2 ${config.className || ''}`}>
      {config.label && (
        <Label
          htmlFor={config.id}
          className={config.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
        >
          {config.label}
        </Label>
      )}
      <Select
        value={value ?? config.defaultValue ?? ''}
        onValueChange={handleChange}
        disabled={config.disabled}
      >
        <SelectTrigger id={config.id}>
          <SelectValue placeholder={config.placeholder || `Select ${config.label}`} />
        </SelectTrigger>
        <SelectContent>
          {config.options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
