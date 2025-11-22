'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ClipboardList, BarChart3, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
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
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold text-slate-900">StockMaster</span>
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
                  ? 'bg-slate-100 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
              )}
            >
              <item.icon
                className={clsx(
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500',
                  'mr-3 h-5 w-5 shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-red-500 group-hover:text-red-600" />
          Sign out
        </button>
      </div>
    </div>
  );
}
