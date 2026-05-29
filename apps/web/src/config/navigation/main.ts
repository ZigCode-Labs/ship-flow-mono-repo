'use client';

import type { NavigationItem } from '@/config/navigation/types';
import {
  Home,
  Factory,
  Package,
  Warehouse,
  Globe,
  Ship,
  BarChart3,
  CreditCard,
} from 'lucide-react';

export const mainMenu: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Main dashboard',
    icon: Home,
  },
  {
    name: 'Domestic',
    href: '/domestic',
    description: 'Domestic operations',
    icon: Factory,
  },
  {
    name: 'Production',
    href: '/production',
    description: 'Production management',
    icon: Package,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    description: 'Inventory management',
    icon: Warehouse,
  },
  {
    name: 'Import',
    href: '/import',
    description: 'Import operations',
    icon: Globe,
  },
  {
    name: 'Exports',
    href: '/exports',
    description: 'Export operations',
    icon: Ship,
  },
  {
    name: 'Reports',
    href: '/reports',
    description: 'Reports and analytics',
    icon: BarChart3,
  },
  {
    name: 'Subscription',
    href: '/subscription',
    description: 'Manage subscription',
    icon: CreditCard,
  },
];
