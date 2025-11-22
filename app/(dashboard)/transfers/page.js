import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';

export default async function TransfersPage() {
  const transfers = await fetchAPI('/inventory/transfers');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Internal Transfers</h1>
        <Link
          href="/transfers/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Transfer
        </Link>
      </div>

      <Table
        headers={['ID', 'From', 'To', 'Status', 'Created By', 'Date']}
        data={transfers}
        renderRow={(transfer) => (
          <tr key={transfer.transfer_id} className="hover:bg-slate-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">#{transfer.transfer_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{transfer.from_warehouse_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{transfer.to_warehouse_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                {transfer.status}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{transfer.created_by_name || 'Unknown'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              {new Date(transfer.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
