'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchFilterBar({ placeholder = 'Search...', statusOptions = [] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleStatusChange = (status) => {
        const params = new URLSearchParams(searchParams);
        if (status) {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('search')?.toString()}
                    className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
            </div>

            {statusOptions.length > 0 && (
                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                        onChange={(e) => handleStatusChange(e.target.value)}
                        defaultValue={searchParams.get('status')?.toString()}
                        className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
