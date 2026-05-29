'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RangeFieldConfig } from '../types';

interface DynamicRangeProps {
  config: RangeFieldConfig;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
}

export function DynamicRange({ config, value, onChange, error }: DynamicRangeProps) {
  const rangeValue = value ?? config.defaultValue ?? 0;
  const minValue = config.min ?? 0;
  const maxValue = config.max ?? 100;
  const stepValue = config.step ?? 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
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
      <div className="space-y-3">
        <Input
          id={config.id}
          type="range"
          min={minValue}
          max={maxValue}
          step={stepValue}
          value={rangeValue}
          onChange={handleChange}
          disabled={config.disabled}
        />
        {config.showValue && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{minValue}</span>
            <span className="font-medium">{rangeValue}</span>
            <span className="text-muted-foreground">{maxValue}</span>
          </div>
        )}
      </div>
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
