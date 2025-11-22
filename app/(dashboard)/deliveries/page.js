import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';

export default async function DeliveriesPage() {
  const deliveries = await fetchAPI('/inventory/deliveries');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Deliveries (Outgoing)</h1>
        <Link
          href="/deliveries/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Delivery
        </Link>
      </div>

      <Table
        headers={['ID', 'Customer', 'Status', 'Created By', 'Date']}
        data={deliveries}
        renderRow={(delivery) => (
          <tr key={delivery.delivery_id} className="hover:bg-slate-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">#{delivery.delivery_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{delivery.customer_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {delivery.status}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{delivery.created_by_name || 'Unknown'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              {new Date(delivery.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
