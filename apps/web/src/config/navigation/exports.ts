'use client';

import type { NavigationItem } from '@/config/navigation/types';
import { Book, CreditCard, FileText, LayoutGrid, Package, Truck, Users } from 'lucide-react';

export const exportsMenu: NavigationItem[] = [
  {
    name: 'Overview',
    href: '/exports/overview',
    description: 'Summary of all documents',
    icon: LayoutGrid,
  },
  {
    name: 'Items Catalog',
    href: '/exports/item',
    description: 'Manage your product catalog',
    icon: Package,
  },
  {
    name: 'Export Documents',
    href: '/exports/documents',
    description: 'Export invoices and documents',
    icon: FileText,
  },
  {
    name: 'Payment Tracking',
    href: '/exports/payment',
    description: 'Monitor export payments',
    icon: CreditCard,
  },
  {
    name: 'Buyer Details',
    href: '/exports/buyer',
    description: 'Manage customer information',
    icon: Users,
  },
  {
    name: 'Buying Agents',
    href: '/exports/buying-agents',
    description: 'Manage buyer representatives and agents',
    icon: Users,
  },
  {
    name: 'Shipping Agents',
    href: '/exports/shipping-agents',
    description: 'Manage logistics partners',
    icon: Truck,
  },
  {
    name: 'Business Contacts',
    href: '/exports/contacts',
    description: 'Manage other business contacts',
    icon: Book,
  },
];
