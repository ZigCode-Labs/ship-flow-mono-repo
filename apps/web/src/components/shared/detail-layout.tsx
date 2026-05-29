'use client';

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/* ─── DetailLayout ─── */

interface DetailLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  leftWidth?: string;
  className?: string;
}

export function DetailLayout({
  leftPanel,
  rightPanel,
  leftWidth: _leftWidth = '23rem',
  className,
}: DetailLayoutProps) {
  return (
    <div className={cn('flex h-full w-full bg-surface text-on-surface', className)}>
      {leftPanel}
      <main className="flex flex-1 h-full bg-slate-50 flex-col relative overflow-hidden print:bg-white">
        {rightPanel}
      </main>
    </div>
  );
}

/* ─── DetailPanel ─── */

interface DetailPanelProps {
  children: ReactNode;
  className?: string;
}

export function DetailPanel({ children, className }: DetailPanelProps) {
  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-surface-container-low border-r border-outline-variant/15 select-none',
        className,
      )}
    >
      {children}
    </aside>
  );
}

/* ─── DetailPanelHeader ─── */

interface DetailPanelHeaderProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
}

export function DetailPanelHeader({ icon, title, action }: DetailPanelHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-3 space-y-3">
      <div className="flex items-center gap-2">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <h1 className="text-sm font-semibold tracking-tight text-on-surface">{title}</h1>
      </div>
      {action}
    </div>
  );
}

/* ─── DetailPanelSearch ─── */

interface DetailPanelSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function DetailPanelSearch({
  value,
  onChange,
  placeholder = 'Search...',
}: DetailPanelSearchProps) {
  return (
    <div className="px-4 pb-3 relative group">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
        <Search className="w-4 h-4 text-secondary" />
      </div>
      <Input
        className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-800"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

/* ─── DetailPanelContent ─── */

interface DetailPanelContentProps {
  children: ReactNode;
  className?: string;
}

export function DetailPanelContent({ children, className }: DetailPanelContentProps) {
  return <div className={cn('flex-1 overflow-y-auto px-4 pb-4', className)}>{children}</div>;
}
