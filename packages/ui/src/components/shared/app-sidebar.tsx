'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Menu, type LucideIcon } from 'lucide-react';

import type { NavigationItem } from '../../config/navigation/types';
import { cn } from '../../lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar';

type AppSidebarProps = {
  items: readonly NavigationItem[];
  icons?: Record<string, LucideIcon>;
  pathnameOverride?: string;
  title?: string;
  collapsible?: 'icon' | 'offcanvas' | 'none';
  showTrigger?: boolean;
  showRail?: boolean;
  className?: string;
};

function getDefaultIcon(): LucideIcon {
  return Package;
}

export function AppSidebar({
  items,
  icons = {},
  pathnameOverride,
  title = 'Menu',
  collapsible = 'icon',
  showTrigger = true,
  showRail = true,
  className,
}: AppSidebarProps) {
  const pathname = usePathname() ?? '';
  const currentPathname = pathnameOverride ?? pathname;

  // Safely get toggleSidebar function
  let toggleSidebar;
  try {
    const sidebar = useSidebar();
    toggleSidebar = sidebar.toggleSidebar;
  } catch (error) {
    // useSidebar must be used within a SidebarProvider
    // Don't show toggle buttons if not in context
  }

  const getItemIcon = (href: string): LucideIcon => {
    const navItem = items.find((item) => item.href === href);
    return navItem?.icon ?? icons[href] ?? getDefaultIcon();
  };

  return (
    <Sidebar
      collapsible={collapsible}
      className={cn('border-r border-border/70 bg-white', className)}
    >
      <SidebarHeader className="gap-0 px-0 py-0">
        <div className="flex items-center justify-between px-4 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <h2 className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            {title}
          </h2>
          {showTrigger && toggleSidebar ? (
            <button
              onClick={toggleSidebar}
              className="size-8 rounded-full text-foreground/60 hover:bg-muted/70 flex items-center justify-center"
            >
              <Menu className="size-4" />
            </button>
          ) : null}
          {showTrigger && (
            <SidebarTrigger className="size-8 rounded-full text-foreground/60 hover:bg-muted/70" />
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent className="px-1.5 py-2">
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive = currentPathname === item.href;
            const Icon = getItemIcon(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={cn(
                    'h-auto min-h-18 items-start rounded-[5px] px-3 py-3 hover:bg-muted/50',
                    'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-[0_14px_30px_-22px_hsl(var(--primary))]',
                    'group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0',
                    'group-data-[collapsible=offcanvas]:p-2',
                  )}
                >
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 group-data-[collapsible=icon]:justify-center"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground/70 transition-colors',
                        'group-data-[collapsible=icon]:mt-0',
                        isActive && 'text-primary-foreground',
                      )}
                    >
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-sm font-medium">{item.name}</span>
                      {item.description ? (
                        <span
                          className={cn(
                            'line-clamp-2 text-xs leading-5 text-muted-foreground',
                            isActive && 'text-primary-foreground/80',
                          )}
                        >
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {showRail ? <SidebarRail /> : null}
    </Sidebar>
  );
}
