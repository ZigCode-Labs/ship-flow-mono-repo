'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DigitsSelect } from '@/components/ui/digits-select';

const schema = z.object({
  prefix: z
    .string()
    .min(1, 'Required')
    .max(10, 'Too long')
    .regex(/^[A-Z0-9]+$/, 'Only A-Z and 0-9'),
  suffix: z
    .string()
    .max(10, 'Too long')
    .regex(/^[A-Z0-9]*$/, 'Only A-Z and 0-9')
    .optional(),
  digits: z.number().int('Must be whole number').min(3, 'Min 3').max(8, 'Max 8'),
});

type FormValues = z.infer<typeof schema>;

type CodeSeriesRowProps = {
  category: string;
  title: string;
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
};

export function CodeSeriesRow({ category, title, initialValues, onSubmit }: CodeSeriesRowProps) {
  const inputClassName = 'h-10 rounded-[5px] border border-border bg-background text-sm';
  const greyTextClassName = 'text-foreground/80';

  const { control, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  React.useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const watchedValues = useWatch({ control }) as FormValues;
  const prefix = watchedValues.prefix ?? '';
  const suffix = watchedValues.suffix ?? '';
  const digits = Math.max(3, Math.min(8, watchedValues.digits || 5));

  const generatePreview = (): string => {
    const safePrefix = prefix || 'PRD';
    const nextNumber = '1'.padStart(digits, '0');
    return suffix ? `${safePrefix}-${nextNumber}-${suffix}` : `${safePrefix}-${nextNumber}`;
  };

  const handleTextChange = (
    field: 'prefix' | 'suffix',
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextValue = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);

    setValue(field, nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const prevValuesRef = React.useRef<FormValues>(initialValues);
  React.useEffect(() => {
    if (!watchedValues) return;
    if (
      watchedValues.prefix !== prevValuesRef.current.prefix ||
      watchedValues.suffix !== prevValuesRef.current.suffix ||
      watchedValues.digits !== prevValuesRef.current.digits
    ) {
      prevValuesRef.current = watchedValues;
      onSubmit(watchedValues);
    }
  }, [watchedValues, onSubmit]);

  return (
    <div className="flex flex-col gap-3 border-b border-border/70 py-4 last:border-0">
      <div className={`text-[11px] font-semibold uppercase tracking-wide ${greyTextClassName}`}>
        {category}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
        <div className="md:col-span-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>

        <div className="flex flex-col gap-1 md:col-span-3">
          <Label className={`text-xs font-medium md:hidden ${greyTextClassName}`}>Prefix *</Label>
          <Input
            value={prefix}
            onChange={(event) => handleTextChange('prefix', event)}
            placeholder="PRD"
            inputMode="text"
            maxLength={10}
            className={`${inputClassName} uppercase`}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-3">
          <Label className={`text-xs font-medium md:hidden ${greyTextClassName}`}>
            Suffix (optional)
          </Label>
          <Input
            value={suffix}
            onChange={(event) => handleTextChange('suffix', event)}
            placeholder="2526"
            inputMode="text"
            maxLength={10}
            className={`${inputClassName} uppercase`}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-1">
          <Label className={`text-xs font-medium md:hidden ${greyTextClassName}`}>Digits</Label>
          <DigitsSelect
            value={digits}
            onChange={(val) =>
              setValue('digits', val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className={inputClassName}
            min={3}
            max={8}
          />
        </div>

        <div
          className={`flex h-10 w-full items-center overflow-hidden whitespace-nowrap rounded-[5px] px-3 font-mono text-xs md:col-span-3 ${greyTextClassName}`}
        >
          {generatePreview()}
        </div>
      </div>
    </div>
  );
}
