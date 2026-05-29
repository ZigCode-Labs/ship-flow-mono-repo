'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckboxFieldConfig } from '../types';

interface DynamicCheckboxProps {
  config: CheckboxFieldConfig;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

export function DynamicCheckbox({ config, value, onChange, error }: DynamicCheckboxProps) {
  const handleChange = (checked: boolean, optionValue?: string | number) => {
    if (config.options) {
      const currentValues = Array.isArray(value) ? value : [];
      if (checked) {
        onChange?.([...currentValues, optionValue]);
      } else {
        onChange?.(currentValues.filter((v: any) => v !== optionValue));
      }
    } else {
      onChange?.(checked);
    }
  };

  if (config.options) {
    const currentValues = Array.isArray(value) ? value : [];

    return (
      <div className={`space-y-3 ${config.className || ''}`}>
        {config.label && (
          <Label
            className={config.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
          >
            {config.label}
          </Label>
        )}
        <div className={config.inline ? 'flex flex-wrap gap-4' : 'space-y-2'}>
          {config.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${config.id}-${option.value}`}
                checked={currentValues.includes(option.value)}
                onCheckedChange={(checked) => handleChange(checked as boolean, option.value)}
                disabled={config.disabled || option.disabled}
              />
              <Label
                htmlFor={`${config.id}-${option.value}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${config.className || ''}`}>
      <Checkbox
        id={config.id}
        checked={value ?? config.defaultValue ?? false}
        onCheckedChange={(checked: boolean) => handleChange(checked)}
        disabled={config.disabled}
      />
      {config.label && (
        <Label
          htmlFor={config.id}
          className={`font-normal cursor-pointer ${config.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}`}
        >
          {config.label}
        </Label>
      )}
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
