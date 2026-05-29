'use client';

import * as React from 'react';
import { useController, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../utils';
import { SelectOption } from '../types';

const selectBase =
  "h-10 w-full rounded-[5px] border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none transition-[color,box-shadow,background-color] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/20 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[right_12px_center] bg-no-repeat pr-10";

interface FormSelectProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  defaultValue?: PathValue<TFieldValues, TName>;
}

export function FormSelect<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  options,
  label,
  placeholder,
  description,
  required,
  disabled,
  className,
  selectClassName,
  defaultValue,
}: FormSelectProps<TFieldValues, TName>) {
  const id = `form-select-${name}`;
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, defaultValue });

  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error?.message}
      required={required}
      className={className}
    >
      <select
        {...field}
        id={id}
        disabled={disabled}
        aria-invalid={!!error}
        value={field.value ?? ''}
        className={cn(selectBase, selectClassName)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
