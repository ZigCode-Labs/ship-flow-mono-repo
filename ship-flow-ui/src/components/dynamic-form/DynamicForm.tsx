'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormConfig, FormValues, FieldConfig } from './types';
import {
  DynamicInput,
  DynamicSelect,
  DynamicCheckbox,
  DynamicRadio,
  DynamicProgress,
  DynamicTextarea,
  DynamicRange,
} from './fields';

interface DynamicFormProps {
  config: FormConfig;
  initialValues?: FormValues;
  formId?: string;
}

export function DynamicForm({ config, initialValues, formId }: DynamicFormProps) {
  const [formValues, setFormValues] = useState<FormValues>(initialValues || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: FieldConfig, value: any): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation && value) {
      const { min, max, minLength, maxLength, pattern, customMessage } = field.validation;

      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          return customMessage || `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return customMessage || `${field.label} must be at most ${max}`;
        }
      }

      if (typeof value === 'string') {
        if (minLength !== undefined && value.length < minLength) {
          return customMessage || `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength !== undefined && value.length > maxLength) {
          return customMessage || `${field.label} must be at most ${maxLength} characters`;
        }
        if (pattern && !new RegExp(pattern).test(value)) {
          return customMessage || `${field.label} format is invalid`;
        }
      }
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    config.fields.forEach((field) => {
      const error = validateField(field, formValues[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (config.onSubmit) {
      config.onSubmit(formValues);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = formValues[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
      case 'tel':
      case 'url':
      case 'search':
        return (
          <DynamicInput
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      case 'select':
        return (
          <DynamicSelect
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      case 'checkbox':
        return (
          <DynamicCheckbox
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      case 'radio':
        return (
          <DynamicRadio
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      case 'progress':
        return (
          <DynamicProgress
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      case 'textarea':
        return (
          <DynamicTextarea
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      case 'range':
        return (
          <DynamicRange
            key={field.id}
            config={field}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {config.title && <h2 className="text-2xl font-semibold">{config.title}</h2>}
      {config.description && <p className="text-muted-foreground">{config.description}</p>}

      <div className="space-y-4">{config.fields.map(renderField)}</div>

      {config.submitButton && (
        <Button
          type="submit"
          variant={config.submitButton.variant || 'default'}
          size={config.submitButton.size || 'default'}
        >
          {config.submitButton.text}
        </Button>
      )}
    </form>
  );
}
