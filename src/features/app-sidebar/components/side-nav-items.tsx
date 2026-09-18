'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { LineChart, ShoppingCart } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: LineChart },
  { title: 'Orders', url: '/orders', icon: ShoppingCart }
];

export function SideNavItems() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <SidebarGroup>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.url === '/'
                ? pathname === '/'
                : pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </motion.div>
  );
}
