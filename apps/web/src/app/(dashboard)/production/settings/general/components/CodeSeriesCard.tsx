'use client';

import * as React from 'react';
import { ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeSeriesRow } from './CodeSeriesRow';
import config from '../data/code-series-config.json';

type CodeSeriesValues = {
  prefix: string;
  suffix?: string;
  digits: number;
};

type CodeSeriesCardProps = {
  values: Record<string, CodeSeriesValues>;
  onChange: (id: string, values: CodeSeriesValues) => void;
};

export function CodeSeriesCard({ values, onChange }: CodeSeriesCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const greyTextClassName = 'text-foreground/80';

  return (
    <Card className="mx-auto h-[686px] w-[976px] gap-0 rounded-[5px] border border-border bg-muted/30 py-0 shadow-none">
      <CardHeader className="p-0">
        <button
          type="button"
          aria-expanded={isExpanded}
          className="flex h-12 w-full items-center justify-between gap-4 px-5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 sm:px-6"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span className="flex flex-col gap-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Code Series Configuration
            </CardTitle>
            {isExpanded ? (
              <span className={`max-w-3xl text-xs ${greyTextClassName}`}>
                Set prefix, optional suffix, and digit padding for auto-generated codes. Only A-Z
                and 0-9 are allowed.
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
            <div className="hidden grid-cols-12 gap-4 border-b border-border/70 pb-2 md:grid">
              <div className={`col-span-2 text-[11px] font-medium ${greyTextClassName}`}>
                &nbsp;
              </div>
              <div className={`col-span-3 text-[11px] font-medium ${greyTextClassName}`}>
                Prefix *
              </div>
              <div className={`col-span-3 text-[11px] font-medium ${greyTextClassName}`}>
                Suffix (optional)
              </div>
              <div className={`col-span-1 text-[11px] font-medium ${greyTextClassName}`}>
                Digits
              </div>
              <div className={`col-span-3 text-[11px] font-medium ${greyTextClassName}`}>
                Preview
              </div>
            </div>

            <div className="flex flex-col">
              {config.codeSeries.map((series) => (
                <CodeSeriesRow
                  key={series.id}
                  category={series.category}
                  title={series.title}
                  initialValues={
                    values[series.id] || {
                      prefix: series.fields.prefix.value,
                      suffix: series.fields.suffix.value,
                      digits: series.fields.digits.value,
                    }
                  }
                  onSubmit={(newValues) => onChange(series.id, newValues)}
                />
              ))}
            </div>

            <div className="mt-4 rounded-[5px] bg-muted/60 px-3 py-3">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {Object.entries(config.nextNumbers).map(([key, value]) => (
                  <span key={key} className={`text-[11px] ${greyTextClassName}`}>
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}{' '}
                    next: {value}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
