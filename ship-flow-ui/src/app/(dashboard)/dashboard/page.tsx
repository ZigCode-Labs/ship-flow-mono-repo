'use client';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Box, FileText, Activity, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome to Export Documentation Platform
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          Streamline your export documentation with AI-powered tools
        </p>
      </div>

      {/* KPI CARDS — full width grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Items" value="0" icon={<Box size={20} />} />
        <KpiCard title="Documents" value="0" icon={<FileText size={20} />} />
        <KpiCard title="Active Orders" value="0" icon={<Activity size={20} />} />
        <KpiCard title="Total Payments" value="$0" icon={<DollarSign size={20} />} />
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick Actions — takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        {/* Recent Activity — takes 1/3 width */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
