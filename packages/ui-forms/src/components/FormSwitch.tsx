'use client';

import * as React from 'react';
import { useController, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../utils';

interface FormSwitchProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  switchLabel?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: PathValue<TFieldValues, TName>;
}

export function FormSwitch<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  label,
  switchLabel,
  description,
  required,
  disabled,
  className,
  defaultValue,
}: FormSwitchProps<TFieldValues, TName>) {
  const id = `form-switch-${name}`;
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, defaultValue });

  const checked = !!field.value;

  return (
    <FormField description={description} error={error?.message} className={className}>
      {label && (
        <p className="text-sm font-semibold text-gray-700">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-red-500">
              *
            </span>
          )}
        </p>
      )}
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-3 cursor-pointer w-fit',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <button
          id={id}
          role="switch"
          type="button"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => field.onChange(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-blue-600' : 'bg-gray-200',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </button>
        {switchLabel && <span className="text-sm text-gray-700">{switchLabel}</span>}
      </label>
    </FormField>
  );
}
