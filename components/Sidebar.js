'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ClipboardList, BarChart3, LogOut, Warehouse, Folder } from 'lucide-react';
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
    <div className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">InvenTrack</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                isActive
                  ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
              )}
            >
              <item.icon
                className={clsx(
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400',
                  'mr-3 h-5 w-5 shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" />
          Sign out
        </button>
      </div>
    </div>
  );
}
