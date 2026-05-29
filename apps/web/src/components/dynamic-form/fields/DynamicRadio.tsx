'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RadioFieldConfig } from '../types';

interface DynamicRadioProps {
  config: RadioFieldConfig;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

export function DynamicRadio({ config, value, onChange, error }: DynamicRadioProps) {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <div className={`space-y-3 ${config.className || ''}`}>
      {config.label && (
        <Label
          className={config.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
        >
          {config.label}
        </Label>
      )}
      <RadioGroup
        value={value ?? config.defaultValue ?? ''}
        onValueChange={handleChange}
        disabled={config.disabled}
        className={config.inline ? 'flex flex-wrap gap-4' : 'space-y-2'}
      >
        {config.options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={String(option.value)}
              id={`${config.id}-${option.value}`}
              disabled={option.disabled}
            />
            <Label htmlFor={`${config.id}-${option.value}`} className="font-normal cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
