'use client';

import { SidebarInset, SidebarProvider } from '../ui/sidebar';

type ModuleShellProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function ModuleShell({ sidebar, children }: ModuleShellProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset className="min-w-0">
        <section className="min-h-screen">{children}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}
