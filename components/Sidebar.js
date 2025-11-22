'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardList,
  BarChart3,
  LogOut,
  Warehouse,
  Folder
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Folder },
  { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
  { name: 'Receipts', href: '/receipts', icon: ArrowDownToLine },
  { name: 'Deliveries', href: '/deliveries', icon: ArrowUpFromLine },
  { name: 'Internal Transfers', href: '/transfers', icon: ArrowLeftRight },
  { name: 'Stock Adjustments', href: '/adjustments', icon: ClipboardList },
  { name: 'Stock Ledger', href: '/ledger', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card text-foreground transition-colors">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold">StockMaster</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={clsx(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isCollapsed ? 'justify-center' : ''
              )}
            >
              <item.icon
                className={clsx(
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400',
                  'h-5 w-5 shrink-0',
                  isCollapsed ? '' : 'mr-3'
                )}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="
            group flex w-full items-center rounded-full px-4 py-2 text-sm font-medium
            bg-red-100 text-red-700
            dark:bg-red-800 dark:text-red-200
            shadow
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-400
          "
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-inherit" />
          Sign out
        </button>
      </div>
    </div>
  );
}
