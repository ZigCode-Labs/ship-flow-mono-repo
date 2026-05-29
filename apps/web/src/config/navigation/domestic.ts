'use client';

import type { NavigationItem } from '@/config/navigation/types';
import { FileMinus, CreditCard, FileText, Package, Settings, Truck, Users } from 'lucide-react';

export const domesticMenu: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/domestic/settings',
    description: 'Number series for domestic documents',
    icon: Settings,
  },
  {
    name: 'Item Catalog',
    href: '/exports/item',
    description: 'Manage your product catalog',
    icon: Package,
  },
  {
    name: 'Domestic Buyers',
    href: '/domestic/buyers',
    description: 'Manage Indian buyers with GST details',
    icon: Users,
  },
  {
    name: 'Domestic Proforma',
    href: '/domestic/proforma',
    description: 'Domestic quotation invoices',
    icon: FileText,
  },
  {
    name: 'Tax Invoices',
    href: '/domestic/invoices',
    description: 'GST-compliant sales invoices',
    icon: FileText,
  },
  {
    name: 'Payment Tracking',
    href: '/domestic/payment',
    description: 'Track domestic invoice payments',
    icon: CreditCard,
  },
  {
    name: 'Credit Notes',
    href: '/domestic/notes',
    description: 'GST-compliant credit notes',
    icon: FileMinus,
  },
  {
    name: 'Delivery Challans',
    href: '/domestic/delivery-challan',
    description: 'Goods movement documents',
    icon: Truck,
  },
];
