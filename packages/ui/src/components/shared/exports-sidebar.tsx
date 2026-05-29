import { exportsMenu } from '../../config/navigation/exports';
import { AppSidebar } from './app-sidebar';

type ExportsSidebarProps = {
  pathnameOverride?: string;
  collapsible?: 'icon' | 'offcanvas' | 'none';
  showTrigger?: boolean;
  showRail?: boolean;
  className?: string;
};

export function ExportsSidebar({
  pathnameOverride,
  collapsible = 'icon',
  showTrigger = true,
  showRail = true,
  className,
}: ExportsSidebarProps) {
  return (
    <AppSidebar
      items={exportsMenu}
      pathnameOverride={pathnameOverride}
      title="Exports"
      collapsible={collapsible}
      showTrigger={showTrigger}
      showRail={showRail}
      className={className}
    />
  );
}
