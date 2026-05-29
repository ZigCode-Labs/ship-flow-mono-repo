'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputFieldConfig } from '../types';

interface DynamicInputProps {
  config: InputFieldConfig;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

export function DynamicInput({ config, value, onChange, error }: DynamicInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = config.type === 'number' ? Number(e.target.value) : e.target.value;
    onChange?.(newValue);
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
      <Input
        id={config.id}
        type={config.type}
        placeholder={config.placeholder}
        value={value ?? config.defaultValue ?? ''}
        onChange={handleChange}
        disabled={config.disabled}
        min={config.validation?.min}
        max={config.validation?.max}
        minLength={config.validation?.minLength}
        maxLength={config.validation?.maxLength}
        pattern={config.validation?.pattern}
      />
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
