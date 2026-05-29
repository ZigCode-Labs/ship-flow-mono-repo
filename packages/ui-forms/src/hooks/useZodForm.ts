'use client';

import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema = z.ZodType<any, any>;

type UseZodFormProps<TSchema extends AnyZodSchema> = Omit<
  UseFormProps<z.output<TSchema> & FieldValues>,
  'resolver'
> & {
  schema: TSchema;
};

export function useZodForm<TSchema extends AnyZodSchema>({
  schema,
  ...formProps
}: UseZodFormProps<TSchema>): UseFormReturn<z.output<TSchema> & FieldValues> {
  return useForm<z.output<TSchema> & FieldValues>({
    ...formProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  });
}
