'use client';

import { AppSidebar } from '@/components/shared/app-sidebar';
import Header from '@/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { mainMenu } from '@/config/navigation/main';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const usesModuleSidebar = pathname.startsWith('/domestic') || pathname.startsWith('/production');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="h-16 flex-shrink-0">
        <Header />
      </div>

      <SidebarProvider defaultOpen={true}>
        <div className="flex flex-1 overflow-hidden">
          {!usesModuleSidebar && (
            <Sidebar collapsible="icon" className="border-r border-border/70 bg-background">
              <AppSidebar items={mainMenu} />
            </Sidebar>
          )}

          <SidebarInset
            className={cn(
              'flex-1 min-w-0 overflow-y-auto transition-all duration-300',
              usesModuleSidebar ? '' : 'bg-gray-50',
            )}
          >
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
