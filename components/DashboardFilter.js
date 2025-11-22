'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function DashboardFilter({ warehouses }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleChange = (e) => {
        const warehouseId = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (warehouseId) {
            params.set('warehouse_id', warehouseId);
        } else {
            params.delete('warehouse_id');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mb-6">
            <select
                onChange={handleChange}
                defaultValue={searchParams.get('warehouse_id') || ''}
                className="block w-full sm:w-64 rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
            </select>
        </div>
    );
}
