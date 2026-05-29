import { domesticMenu } from '@/config/navigation/domestic';
import { AppSidebar } from '@/components/shared/app-sidebar';

type DomesticSidebarProps = {
  pathnameOverride?: string;
  collapsible?: 'icon' | 'offcanvas' | 'none';
  showTrigger?: boolean;
  showRail?: boolean;
  className?: string;
};

export function DomesticSidebar({
  pathnameOverride,
  collapsible = 'icon',
  showTrigger = true,
  showRail = true,
  className,
}: DomesticSidebarProps) {
  return (
    <AppSidebar
      items={domesticMenu}
      pathnameOverride={pathnameOverride}
      title="Domestic"
      collapsible={collapsible}
      showTrigger={showTrigger}
      showRail={showRail}
      className={className}
    />
  );
}
