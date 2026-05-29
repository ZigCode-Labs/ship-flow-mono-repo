'use client';

import * as React from 'react';
import { cn } from '../utils';

interface FormFieldProps {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-sm font-semibold leading-none text-gray-700 select-none"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {description && !error && <p className="text-sm text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
