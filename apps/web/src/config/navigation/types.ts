import type { LucideIcon } from 'lucide-react';

export type NavigationItem = {
  name: string;
  href: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  children?: NavigationItem[];
};
