'use client';

import * as React from 'react';
import { ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import config from '../data/code-series-config.json';

type DefaultsValues = {
  baseCurrency: string;
  paymentTerms: string;
};

type DefaultsCardProps = {
  values: DefaultsValues;
  onChange: (values: DefaultsValues) => void;
};

export function DefaultsCard({ values, onChange }: DefaultsCardProps) {
  const { defaults } = config;
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleCurrencyChange = (value: string) => {
    onChange({ ...values, baseCurrency: value });
  };

  const handlePaymentTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...values, paymentTerms: e.target.value });
  };

  return (
    <Card className="mx-auto h-[209px] w-[976px] gap-0 rounded-[5px] border border-border bg-muted/30 py-0 shadow-none">
      <CardHeader className="p-0">
        <button
          type="button"
          aria-expanded={isExpanded}
          className="flex h-12 w-full items-center justify-between gap-4 px-5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 sm:px-6"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span className="flex flex-col gap-1">
            <CardTitle className="text-sm font-semibold text-foreground">Defaults</CardTitle>
            {isExpanded ? (
              <span className="text-xs text-muted-foreground">
                Default values for new POs and job work challans.
              </span>
            ) : null}
          </span>
          <ChevronUp
            className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
              isExpanded ? '' : 'rotate-180'
            }`}
          />
        </button>
      </CardHeader>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden bg-background">
          <CardContent className="px-5 pb-5 pt-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  {defaults.baseCurrency.label}
                </Label>
                <Select value={values.baseCurrency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="h-11 rounded-[5px] border border-border bg-background text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {defaults.baseCurrency.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  {defaults.paymentTerms.label}
                </Label>
                <Textarea
                  value={values.paymentTerms}
                  onChange={handlePaymentTermsChange}
                  placeholder={defaults.paymentTerms.placeholder}
                  rows={defaults.paymentTerms.rows}
                  className="min-h-[92px] resize-none rounded-[5px] border border-border bg-background text-sm"
                />
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
