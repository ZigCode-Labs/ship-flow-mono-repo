'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FieldDefinition, FieldOption } from '../data/field-definitions';

interface CostSheetFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  bgWhite?: boolean;
}

export function CostSheetField({
  field,
  value,
  onChange,
  error,
  bgWhite = false,
}: CostSheetFieldProps) {
  const {
    id,
    name,
    type,
    label,
    placeholder,
    required,
    disabled,
    readOnly,
    prefix,
    suffix,
    helperText,
  } = field;

  const renderInput = () => {
    const baseInputClasses = cn(
      'h-10 w-full rounded-[5px] border border-gray-200 px-4 py-2 text-sm text-gray-900 transition-[color,box-shadow,background-color] outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      bgWhite ? 'bg-white' : 'bg-gray-50',
      error && 'border-red-500 ring-2 ring-red-500/20',
      readOnly && 'bg-gray-100 cursor-not-allowed',
      prefix && 'pl-8',
      suffix && 'pr-8',
    );

    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            name={name}
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={required}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={id}
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={required}
            rows={(field as any).rows || 3}
            className={cn(baseInputClasses, 'min-h-20 resize-none')}
          />
        );

      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <div className="relative">
            {prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                {prefix}
              </span>
            )}
            <Input
              id={id}
              name={name}
              type="number"
              placeholder={placeholder || '0'}
              value={value !== undefined && value !== null ? value : ''}
              onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
              disabled={disabled || readOnly}
              required={required}
              min={(field as any).min}
              max={(field as any).max}
              step={(field as any).step || (type === 'currency' ? 0.01 : 1)}
              className={cn(baseInputClasses, prefix && 'pl-8', suffix && 'pr-8')}
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                {suffix}
              </span>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            id={id}
            name={name}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={required}
            className={baseInputClasses}
          />
        );

      case 'select':
        const selectField = field as FieldDefinition & { options: FieldOption[] };
        return (
          <Select value={value || ''} onValueChange={onChange} disabled={disabled || readOnly}>
            <SelectTrigger
              id={id}
              className={cn(
                'h-10 w-full rounded-[5px] border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                bgWhite ? 'bg-white' : 'bg-gray-50',
                error && 'border-red-500 ring-2 ring-red-500/20',
              )}
            >
              <SelectValue placeholder={placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {selectField.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
      case 'button-group':
        const radioField = field as FieldDefinition & { options: FieldOption[]; inline?: boolean };
        return (
          <div className="flex flex-row gap-2">
            {radioField.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                disabled={disabled || readOnly}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium rounded-[5px] transition-all',
                  value === option.value
                    ? 'bg-blue-600 text-white'
                    : bgWhite
                      ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  (disabled || readOnly) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center gap-3">
            <Switch
              id={id}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled || readOnly}
            />
            <span className="text-sm text-gray-600">{value ? 'Yes' : 'No'}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-1.5', field.className)}>
      <Label
        htmlFor={id}
        requiredIndicator={required}
        className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
      >
        {label}
      </Label>
      {renderInput()}
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
