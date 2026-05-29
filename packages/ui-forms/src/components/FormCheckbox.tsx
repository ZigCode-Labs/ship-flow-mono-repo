'use client';

import * as React from 'react';
import { useController, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../utils';
import { CheckboxOption } from '../types';

const checkboxBase =
  'h-4 w-4 rounded border border-gray-300 bg-gray-50 accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

interface FormCheckboxProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: PathValue<TFieldValues, TName>;
  /** Single checkbox label (when used as a boolean toggle) */
  checkLabel?: string;
  /** Multiple options render a checkbox group */
  options?: CheckboxOption[];
  inline?: boolean;
}

export function FormCheckbox<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  defaultValue,
  checkLabel,
  options,
  inline = false,
}: FormCheckboxProps<TFieldValues, TName>) {
  const id = `form-checkbox-${name}`;
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, defaultValue });

  if (options && options.length > 0) {
    const selectedValues: (string | number)[] = Array.isArray(field.value) ? field.value : [];

    const toggle = (value: string | number) => {
      const next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      field.onChange(next);
    };

    return (
      <FormField
        label={label}
        description={description}
        error={error?.message}
        required={required}
        className={className}
      >
        <div className={cn('gap-3', inline ? 'flex flex-wrap' : 'flex flex-col')}>
          {options.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-2 text-sm text-gray-700 cursor-pointer',
                (disabled || opt.disabled) && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="checkbox"
                value={String(opt.value)}
                checked={selectedValues.includes(opt.value)}
                disabled={disabled || opt.disabled}
                onChange={() => toggle(opt.value)}
                className={checkboxBase}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FormField>
    );
  }

  return (
    <FormField description={description} error={error?.message} className={className}>
      <label
        className={cn(
          'flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={!!field.value}
          disabled={disabled}
          onChange={(e) => field.onChange(e.target.checked)}
          required={required}
          className={checkboxBase}
        />
        {checkLabel ?? label}
        {required && (
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        )}
      </label>
    </FormField>
  );
}
