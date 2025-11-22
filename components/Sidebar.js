'use client';

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
              className={clsx(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-accent-foreground'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.name}
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
