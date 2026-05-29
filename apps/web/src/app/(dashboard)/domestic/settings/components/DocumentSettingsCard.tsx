'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  prefix: z
    .string()
    .min(1, 'Prefix is required')
    .max(10, 'Prefix too long')
    .regex(/^[A-Z0-9]+$/, 'Letters and numbers only, no spaces'),
  digits: z
    .number()
    .int('Must be a whole number')
    .min(2, 'Minimum 2 digits')
    .max(6, 'Maximum 6 digits'),
  startingNumber: z.number().int('Must be a whole number').min(1, 'Minimum 1'),
});

type FormValues = z.infer<typeof schema>;

type DocumentSettingsCardProps = {
  title: string;
  description: string;
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
};

export function DocumentSettingsCard({
  title,
  description,
  initialValues,
  onSubmit,
}: DocumentSettingsCardProps) {
  const inputClassName = 'h-7 rounded-[5px] border border-border bg-white text-[10px]';
  const {
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  React.useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const watchedValues = useWatch({ control }) as FormValues;
  const currentYear = new Date().getFullYear();
  const financialYear = `${String(currentYear).slice(-2)}-${String(currentYear + 1).slice(-2)}`;
  const safeDigits = Math.max(2, Math.min(6, watchedValues.digits || 5));
  const preview = `${watchedValues.prefix}-${financialYear}-${String(watchedValues.startingNumber).padStart(safeDigits, '0')}`;

  const prevValuesRef = React.useRef<FormValues>(initialValues);
  React.useEffect(() => {
    if (!watchedValues) return;
    if (
      watchedValues.prefix !== prevValuesRef.current.prefix ||
      watchedValues.digits !== prevValuesRef.current.digits ||
      watchedValues.startingNumber !== prevValuesRef.current.startingNumber
    ) {
      prevValuesRef.current = watchedValues;
      onSubmit(watchedValues);
    }
  }, [watchedValues, onSubmit]);

  return (
    <Card className="rounded-[5px] bg-white shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-0">
          <CardTitle className="text-xs font-semibold">{title}</CardTitle>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="font-mono text-[10px]">
          {preview}
        </Badge>
      </CardHeader>
      <CardContent className="pb-3 pt-2">
        <form className="grid grid-cols-3 gap-2" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${title}-prefix`} className="text-[10px] font-medium">
              PREFIX
            </Label>
            <Input
              id={`${title}-prefix`}
              {...register('prefix')}
              placeholder="INV"
              className={`${inputClassName} uppercase`}
            />
            {errors.prefix?.message ? (
              <p className="text-[9px] text-destructive">{errors.prefix.message}</p>
            ) : (
              <p className="text-[9px] text-muted-foreground">
                Letters and numbers only, no spaces
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor={`${title}-digits`} className="text-[10px] font-medium">
              DIGITS (PADDING)
            </Label>
            <Input
              id={`${title}-digits`}
              type="number"
              {...register('digits', { valueAsNumber: true })}
              className={inputClassName}
            />
            {errors.digits?.message ? (
              <p className="text-[9px] text-destructive">{errors.digits.message}</p>
            ) : (
              <p className="text-[9px] text-muted-foreground">Min 2, max 6</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor={`${title}-starting`} className="text-[10px] font-medium">
              STARTING NUMBER
            </Label>
            <Input
              id={`${title}-starting`}
              type="number"
              {...register('startingNumber', { valueAsNumber: true })}
              className={inputClassName}
            />
            {errors.startingNumber?.message ? (
              <p className="text-[9px] text-destructive">{errors.startingNumber.message}</p>
            ) : (
              <p className="text-[9px] text-muted-foreground">Only when no docs exist yet</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
