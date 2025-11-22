import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';
import ValidateButton from '@/components/ValidateButton';
import SearchFilterBar from '@/components/SearchFilterBar';

export default async function DeliveriesPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || '';
  const status = params?.status || '';
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const deliveries = await fetchAPI(`/inventory/deliveries${queryString}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Deliveries (Outgoing)</h1>
        <Link
          href="/deliveries/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Delivery
        </Link>
      </div>

      <SearchFilterBar placeholder="Search customer..." statusOptions={['draft', 'done', 'cancelled']} />

      <Table
        headers={['ID', 'Customer', 'Status', 'Created By', 'Date', 'Actions']}
        data={deliveries}
        renderRow={(delivery) => (
          <tr key={delivery.delivery_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">#{delivery.delivery_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{delivery.customer_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-400">
                {delivery.status}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{delivery.created_by_name || 'Unknown'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(delivery.created_at).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {delivery.status === 'draft' && (
                <ValidateButton id={delivery.delivery_id} type="deliveries" />
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
