'use client';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';

import { Box, FileText, Activity, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl space-y-6 px-6 py-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Welcome to Export Documentation Platform</h1>
          <p className="text-muted-foreground">
            Streamline your export documentation with AI-powered tools
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Items" value="0" icon={<Box size={20} />} />
          <KpiCard title="Documents" value="0" icon={<FileText size={20} />} />
          <KpiCard title="Active Orders" value="0" icon={<Activity size={20} />} />
          <KpiCard title="Total Payments" value="$0" icon={<DollarSign size={20} />} />
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* LEFT - QUICK ACTIONS */}
          <div className="lg:col-span-2">
            <QuickActions />
          </div>

          {/* RIGHT - RECENT ACTIVITY */}
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
