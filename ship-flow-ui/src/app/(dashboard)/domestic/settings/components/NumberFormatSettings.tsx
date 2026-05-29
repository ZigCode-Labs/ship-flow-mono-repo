'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface FieldConfig {
  label: string;
  type: string;
  value: string | number;
  placeholder: string;
  validation: {
    required: boolean;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface SectionConfig {
  id: string;
  title: string;
  description: string;
  fields: {
    prefix: FieldConfig;
    digits: FieldConfig;
    startingNumber: FieldConfig;
  };
  generatedFormat: string;
  formatTemplate: string;
}

interface NumberFormatConfig {
  formSections: SectionConfig[];
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
  };
}

export function NumberFormatSettings() {
  const [config, setConfig] = React.useState<NumberFormatConfig | null>(null);

  const createSchema = (sections: SectionConfig[]) => {
    const shape: Record<
      string,
      z.ZodObject<{ prefix: z.ZodString; digits: z.ZodNumber; startingNumber: z.ZodNumber }>
    > = {};
    sections.forEach((section) => {
      shape[section.id] = schema;
    });
    return z.object(shape);
  };

  const [dynamicSchema, setDynamicSchema] = React.useState<
    z.ZodObject<
      Record<
        string,
        z.ZodObject<{ prefix: z.ZodString; digits: z.ZodNumber; startingNumber: z.ZodNumber }>
      >
    >
  >(z.object({}));

  const methods = useForm<Record<string, FormValues>>({
    mode: 'onChange',
    resolver: zodResolver(dynamicSchema) as any,
  });

  const trigger = methods.trigger;

  React.useEffect(() => {
    import('@/app/(dashboard)/domestic/settings/data/number-format-config.json')
      .then((module) => {
        const configData = module.default as NumberFormatConfig;
        setConfig(configData);

        const newSchema = createSchema(configData.formSections);
        setDynamicSchema(newSchema);

        const initialData: Record<string, FormValues> = {};
        configData.formSections.forEach((section) => {
          initialData[section.id] = {
            prefix: section.fields.prefix.value as string,
            digits: section.fields.digits.value as number,
            startingNumber: section.fields.startingNumber.value as number,
          };
        });
        methods.reset(initialData);
      })
      .catch((error) => {
        console.error('Failed to load config:', error);
      });
  }, [methods]);

  const watchedValues = methods.watch();
  const errors = methods.formState.errors;

  // Generate financial year (current year - next year format like 26-27)
  const currentYear = new Date().getFullYear();
  const financialYear = `${String(currentYear).slice(-2)}-${String(currentYear + 1).slice(-2)}`;

  const generateFormat = (section: SectionConfig, data: FormValues): string => {
    const prefix = data.prefix || section.fields.prefix.value;
    const digits = data.digits || section.fields.digits.value;
    const startingNumber = data.startingNumber || section.fields.startingNumber.value;
    const safeDigits = Math.max(2, Math.min(6, Number(digits)));
    const paddedNumber = String(startingNumber).padStart(safeDigits, '0');
    return `${prefix}-${financialYear}-${paddedNumber}`;
  };

  if (!config) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Number Format Settings</h2>
        <p className="text-muted-foreground">
          Configure the number format for different document types
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {config.formSections.map((section) => {
          const sectionData = watchedValues[section.id] || {
            prefix: section.fields.prefix.value,
            digits: section.fields.digits.value,
            startingNumber: section.fields.startingNumber.value,
          };
          const generatedFormat = generateFormat(section, sectionData as FormValues);
          const sectionErrors = errors[section.id];

          return (
            <Card key={section.id} className="border-2">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${section.id}-prefix`} requiredIndicator>
                    {section.fields.prefix.label}
                  </Label>
                  <Input
                    id={`${section.id}-prefix`}
                    type={section.fields.prefix.type}
                    placeholder={section.fields.prefix.placeholder}
                    {...methods.register(`${section.id}.prefix` as const, {
                      onChange: (e) => {
                        methods.setValue(
                          `${section.id}.prefix` as const,
                          e.target.value.toUpperCase(),
                        );
                        trigger(`${section.id}.prefix` as const);
                      },
                    })}
                    className="uppercase"
                  />
                  {sectionErrors?.prefix?.message && (
                    <p className="text-xs text-destructive">{sectionErrors.prefix.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${section.id}-digits`} requiredIndicator>
                    {section.fields.digits.label}
                  </Label>
                  <Input
                    id={`${section.id}-digits`}
                    type={section.fields.digits.type}
                    placeholder={section.fields.digits.placeholder}
                    {...methods.register(`${section.id}.digits` as const, {
                      valueAsNumber: true,
                      onChange: () => trigger(`${section.id}.digits` as const),
                    })}
                  />
                  {sectionErrors?.digits?.message && (
                    <p className="text-xs text-destructive">{sectionErrors.digits.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${section.id}-startingNumber`} requiredIndicator>
                    {section.fields.startingNumber.label}
                  </Label>
                  <Input
                    id={`${section.id}-startingNumber`}
                    type={section.fields.startingNumber.type}
                    placeholder={section.fields.startingNumber.placeholder}
                    {...methods.register(`${section.id}.startingNumber` as const, {
                      valueAsNumber: true,
                      onChange: () => trigger(`${section.id}.startingNumber` as const),
                    })}
                  />
                  {sectionErrors?.startingNumber?.message && (
                    <p className="text-xs text-destructive">
                      {sectionErrors.startingNumber.message}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Generated Format:</p>
                  <p className="text-sm font-mono font-semibold">{generatedFormat}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
