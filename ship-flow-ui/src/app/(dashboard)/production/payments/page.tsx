'use client';

import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Payments</h1>
            <p className="text-sm text-muted-foreground">Record & track production payments</p>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-dashed border-border p-8">
        <p className="text-center text-muted-foreground">
          Payments content will be implemented here.
        </p>
      </div>
    </div>
  );
}
