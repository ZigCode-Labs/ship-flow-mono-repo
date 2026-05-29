'use client';

import * as React from 'react';
import { useController, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../utils';
import { InputType } from '../types';

const inputBase =
  'h-10 w-full min-w-0 rounded-[5px] border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none transition-[color,box-shadow,background-color] placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/20';

interface FormInputProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  type?: InputType;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  defaultValue?: PathValue<TFieldValues, TName>;
}

export function FormInput<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  type = 'text',
  label,
  placeholder,
  description,
  required,
  disabled,
  className,
  inputClassName,
  defaultValue,
}: FormInputProps<TFieldValues, TName>) {
  const id = `form-input-${name}`;
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
      <input
        {...field}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        value={field.value ?? ''}
        onChange={(e) => {
          const val = type === 'number' ? e.target.valueAsNumber : e.target.value;
          field.onChange(val);
        }}
        className={cn(inputBase, inputClassName)}
      />
    </FormField>
  );
}
