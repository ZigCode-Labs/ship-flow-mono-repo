'use client';

import * as React from 'react';
import { useController, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../utils';

const textareaBase =
  'w-full min-w-0 rounded-[5px] border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none transition-[color,box-shadow,background-color] placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/20';

interface FormTextareaProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  className?: string;
  textareaClassName?: string;
  defaultValue?: PathValue<TFieldValues, TName>;
}

export function FormTextarea<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  label,
  placeholder,
  description,
  required,
  disabled,
  rows = 3,
  resize = 'vertical',
  className,
  textareaClassName,
  defaultValue,
}: FormTextareaProps<TFieldValues, TName>) {
  const id = `form-textarea-${name}`;
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, defaultValue });

  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }[resize];

  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error?.message}
      required={required}
      className={className}
    >
      <textarea
        {...field}
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-invalid={!!error}
        value={field.value ?? ''}
        className={cn(textareaBase, resizeClass, textareaClassName)}
      />
    </FormField>
  );
}
