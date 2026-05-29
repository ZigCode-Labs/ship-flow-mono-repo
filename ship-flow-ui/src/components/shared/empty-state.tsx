'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-1 items-center justify-center', className)}>
      <div className="flex h-[268px] w-[448px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
        {icon && (
          <div className="mb-4 flex size-16 items-center justify-center rounded-lg bg-muted/50">
            <div className="text-muted-foreground">{icon}</div>
          </div>
        )}
        <h3 className="mb-2 text-base font-medium">{title}</h3>
        {description && (
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            size={action.size || 'default'}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
