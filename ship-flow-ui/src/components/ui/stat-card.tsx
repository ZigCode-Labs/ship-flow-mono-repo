'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'orange' | 'purple';
  className?: string;
}

const variants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    label: 'text-blue-700',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    label: 'text-green-700',
    icon: 'text-green-600',
    border: 'border-green-100',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    label: 'text-orange-700',
    icon: 'text-orange-600',
    border: 'border-orange-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    label: 'text-purple-700',
    icon: 'text-purple-600',
    border: 'border-purple-100',
  },
};

export function StatCard({ label, value, icon: Icon, variant = 'blue', className }: StatCardProps) {
  const styles = variants[variant];

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-[5px] border px-4 py-3',
        styles.bg,
        styles.border,
        className,
      )}
    >
      <div className="flex flex-col">
        <span className={cn('text-xs font-medium', styles.label)}>{label}</span>
        <span className={cn('text-xl font-semibold', styles.text)}>{value}</span>
      </div>
      <Icon className={cn('size-5', styles.icon)} />
    </div>
  );
}

interface StatCardsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatCardsGrid({ children, className }: StatCardsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
