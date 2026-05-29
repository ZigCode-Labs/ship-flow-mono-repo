import { ReactNode } from 'react';

export function KpiCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4  hover:bg-muted">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
      </div>
      <div className="rounded-lg bg-muted p-3 text-orange-500">{icon}</div>
    </div>
  );
}
