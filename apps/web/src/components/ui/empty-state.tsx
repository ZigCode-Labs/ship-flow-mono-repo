'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  icon: LucideIcon;
  onAdd: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  buttonText,
  icon: Icon,
  onAdd,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-52 flex-col items-center justify-center gap-2 rounded-[5px] border border-dashed border-border bg-white p-8 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-[5px] bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Button size="sm" variant="outline" className="mt-1 gap-1.5 rounded-[5px]" onClick={onAdd}>
        <Plus data-icon="inline-start" />
        {buttonText}
      </Button>
    </div>
  );
}
