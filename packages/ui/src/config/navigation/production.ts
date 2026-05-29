'use client';

import type { NavigationItem } from './types';
import {
  Calculator,
  CreditCard,
  Layers,
  Package,
  Settings,
  ShoppingCart,
  Wrench,
} from 'lucide-react';

export const productionMenu: NavigationItem[] = [
  {
    name: 'Production Settings',
    href: '/production/settings',
    description: 'Configure code series and defaults',
    icon: Settings,
  },
  {
    name: 'Item Register',
    href: '/production/item-register',
    description: 'Manage production materials & components',
    icon: Package,
  },
  {
    name: 'Cost Sheets',
    href: '/production/cost-sheets',
    description: 'Compute landed cost & export pricing',
    icon: Calculator,
  },
  {
    name: 'Purchase Orders',
    href: '/production/purchase-orders',
    description: 'Create and manage supplier purchase orders',
    icon: ShoppingCart,
  },
  {
    name: 'Job Work',
    href: '/production/job-work',
    description: 'Manage outsourced job work orders',
    icon: Wrench,
  },
  {
    name: 'Payments',
    href: '/production/payments',
    description: 'Record & track production payments',
    icon: CreditCard,
  },
  {
    name: 'Raw Materials',
    href: '/production/raw-materials',
    description: 'Raw material management',
    icon: Layers,
    children: [
      {
        name: 'RM Register',
        href: '/production/raw-materials/register',
        description: 'View and manage raw material items',
      },
      {
        name: 'RM Inventory',
        href: '/production/raw-materials/inventory',
        description: 'Raw material stock movements & balances',
      },
      {
        name: 'RM Purchases',
        href: '/production/raw-materials/purchases',
        description: 'Purchase orders for raw materials',
      },
    ],
  },
];
