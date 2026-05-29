'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { NavigationItem } from '../../config/navigation/types';
import { productionMenu } from '../../config/navigation/production';
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
} from '../ui/sidebar';

function SidebarMenuItemWithChildren({
  item,
  isActive,
  pathname,
  defaultOpen = false,
}: {
  item: NavigationItem;
  isActive: boolean;
  pathname: string;
  defaultOpen?: boolean;
}) {
  const hasActiveChild = item.children?.some((child) => pathname.startsWith(child.href));
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveChild);
  const Icon = item.icon;

  return (
    <div className="flex flex-col">
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          isActive={isActive}
          tooltip={item.name}
          className={cn(
            'h-auto min-h-18 items-start rounded-[5px] px-3 py-3 hover:bg-muted/50 cursor-pointer',
            'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-[0_14px_30px_-22px_hsl(var(--primary))]',
            'group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0',
            'group-data-[collapsible=offcanvas]:p-2',
          )}
        >
          <div className="flex items-start gap-3 w-full group-data-[collapsible=icon]:justify-center">
            <span
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70 transition-colors',
                'group-data-[collapsible=icon]:mt-0',
                isActive && 'bg-primary-foreground/15 text-primary-foreground',
              )}
            >
              {Icon && <Icon className="size-5" strokeWidth={1.5} />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden">
              <span className="flex items-center justify-between">
                <span className="truncate text-sm font-medium">{item.name}</span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </span>
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
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isOpen && item.children && (
        <div className="ml-4 pl-4 border-l border-border/50 space-y-1 py-1 group-data-[collapsible=icon]:hidden">
          {item.children.map((child) => {
            const isChildActive = pathname.startsWith(child.href);
            const ChildIcon = child.icon;

            return (
              <SidebarMenuItem key={child.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isChildActive}
                  tooltip={child.name}
                  className={cn(
                    'h-auto min-h-14 items-start rounded-[5px] px-3 py-2 hover:bg-muted/50',
                    'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
                    isChildActive &&
                      'bg-primary text-primary-foreground shadow-[0_14px_30px_-22px_hsl(var(--primary))]',
                  )}
                >
                  <Link href={child.href} className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground/60',
                        isChildActive && 'bg-primary-foreground/15 text-primary-foreground',
                      )}
                    >
                      {ChildIcon ? (
                        <ChildIcon className="size-4" strokeWidth={1.5} />
                      ) : (
                        <div className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{child.name}</span>
                      {child.description ? (
                        <span
                          className={cn(
                            'line-clamp-2 text-xs leading-4 text-muted-foreground',
                            isChildActive && 'text-primary-foreground/80',
                          )}
                        >
                          {child.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProductionSidebar({
  pathnameOverride,
  collapsible = 'icon',
  showTrigger = true,
  showRail = true,
  className,
}: {
  pathnameOverride?: string;
  collapsible?: 'icon' | 'offcanvas' | 'none';
  showTrigger?: boolean;
  showRail?: boolean;
  className?: string;
}) {
  const pathname = usePathname() ?? '';
  const currentPathname = pathnameOverride ?? pathname;

  return (
    <Sidebar
      collapsible={collapsible}
      className={cn('border-r border-border/70 bg-background', className)}
    >
      <SidebarHeader className="gap-0 px-0 py-0">
        <div className="flex items-center justify-between px-4 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <h2 className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Production
          </h2>
          {showTrigger ? (
            <SidebarTrigger className="size-8 rounded-full text-foreground/60 hover:bg-muted/70" />
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent className="px-1.5 py-2">
        <SidebarMenu className="gap-1">
          {productionMenu.map((item) => {
            const isActive = currentPathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.children && item.children.length > 0) {
              return (
                <SidebarMenuItemWithChildren
                  key={item.href}
                  item={item}
                  isActive={false}
                  pathname={currentPathname}
                />
              );
            }

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
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70 transition-colors',
                        'group-data-[collapsible=icon]:mt-0',
                        isActive && 'bg-primary-foreground/15 text-primary-foreground',
                      )}
                    >
                      {Icon && <Icon className="size-5" strokeWidth={1.5} />}
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
