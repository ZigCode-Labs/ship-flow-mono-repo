'use client';

import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export type SettingsNavigationItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type SettingsNavigationCardProps = {
  title: string;
  items: SettingsNavigationItem[];
  activeItemId: string;
  onItemChange: (itemId: string) => void;
  className?: string;
};

export function SettingsNavigationCard({
  title,
  items,
  activeItemId,
  onItemChange,
  className,
}: SettingsNavigationCardProps) {
  return (
    <Card
      className={cn(
        'h-full w-full rounded-none border-border bg-background py-0 shadow-none',
        className,
      )}
    >
      <CardHeader className="border-b border-border/70 px-4 py-4">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-1.5 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItemId;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onItemChange(item.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-[5px] border border-transparent px-3 py-3 text-left transition-colors',
                'hover:bg-muted/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
                isActive && 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/10',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 size-4 shrink-0 text-muted-foreground',
                  isActive && 'text-primary',
                )}
                strokeWidth={1.7}
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={cn(
                    'truncate text-sm font-medium text-foreground',
                    isActive && 'text-primary',
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    'line-clamp-2 text-xs leading-4 text-muted-foreground',
                    isActive && 'text-primary/80',
                  )}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
