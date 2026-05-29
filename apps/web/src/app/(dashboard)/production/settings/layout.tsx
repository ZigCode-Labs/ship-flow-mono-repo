'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings, Truck, Users, MapPin, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNavItems = [
  {
    id: 'general',
    label: 'General',
    description: 'Code series & defaults',
    icon: Settings,
    href: '/production/settings/general',
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    description: 'Manage supplier contacts',
    icon: Truck,
    href: '/production/settings/suppliers',
  },
  {
    id: 'job-workers',
    label: 'Job Workers',
    description: 'Manage job worker contacts',
    icon: Users,
    href: '/production/settings/job-workers',
  },
  {
    id: 'delivery-locations',
    label: 'Delivery Locations',
    description: 'Your delivery addresses',
    icon: MapPin,
    href: '/production/settings/delivery-locations',
  },
  {
    id: 'job-work-types',
    label: 'Job Work Types',
    description: 'Define outsourced work categories',
    icon: Wrench,
    href: '/production/settings/job-work-types',
  },
];

export default function ProductionSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:block">
        <div className="flex flex-col gap-1 p-3">
          <div className="px-3 py-2">
            <h2 className="text-sm font-semibold text-foreground">Production Settings</h2>
          </div>
          <nav className="flex flex-col gap-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-start gap-3 rounded-[5px] px-3 py-2.5 text-left transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50',
                  )}
                >
                  <item.icon className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="border-b border-border bg-background p-3">
          <div className="mb-2 px-1">
            <h2 className="text-sm font-semibold text-foreground">Production Settings</h2>
          </div>
          <nav className="flex flex-col gap-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-start gap-3 rounded-[5px] px-3 py-2.5 text-left transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50',
                  )}
                >
                  <item.icon className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full flex-col gap-5 px-4 pb-12 pt-4 sm:px-6 sm:pb-14 sm:pt-5 lg:px-8 lg:pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}
