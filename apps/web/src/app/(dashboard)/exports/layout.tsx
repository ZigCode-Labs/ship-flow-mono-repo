import { ModuleShell } from '@/components/layouts/module-shell';
import { ExportsSidebar } from '@/components/shared/exports-sidebar';

export default function ExportsLayout({ children }: { children: React.ReactNode }) {
  return <ModuleShell sidebar={<ExportsSidebar collapsible="icon" />}>{children}</ModuleShell>;
}
