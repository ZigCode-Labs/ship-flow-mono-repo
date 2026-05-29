'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextareaFieldConfig } from '../types';

interface DynamicTextareaProps {
  config: TextareaFieldConfig;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

export function DynamicTextarea({ config, value, onChange, error }: DynamicTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const resizeClass = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  }[config.resize || 'vertical'];

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
      <Textarea
        id={config.id}
        placeholder={config.placeholder}
        value={value ?? config.defaultValue ?? ''}
        onChange={handleChange}
        disabled={config.disabled}
        rows={config.rows || 3}
        className={resizeClass}
        minLength={config.validation?.minLength}
        maxLength={config.validation?.maxLength}
      />
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
