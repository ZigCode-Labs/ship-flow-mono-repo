'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ icon, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 border-b pb-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            {icon && (
              <div className="flex size-10 items-center justify-center rounded-lg">{icon}</div>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
