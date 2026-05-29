'use client';

import * as React from 'react';
import { useController, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../utils';
import { RadioOption } from '../types';

interface FormRadioGroupProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  options: RadioOption[];
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  inline?: boolean;
  className?: string;
  defaultValue?: PathValue<TFieldValues, TName>;
}

export function FormRadioGroup<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  options,
  label,
  description,
  required,
  disabled,
  inline = false,
  className,
  defaultValue,
}: FormRadioGroupProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, defaultValue });

  return (
    <FormField
      label={label}
      description={description}
      error={error?.message}
      required={required}
      className={className}
    >
      <div role="radiogroup" className={cn('gap-3', inline ? 'flex flex-wrap' : 'flex flex-col')}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-2 text-sm text-gray-700 cursor-pointer',
              (disabled || opt.disabled) && 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              type="radio"
              name={name}
              value={String(opt.value)}
              checked={String(field.value) === String(opt.value)}
              disabled={disabled || opt.disabled}
              onChange={() => field.onChange(opt.value)}
              className="h-4 w-4 border border-gray-300 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </FormField>
  );
}
