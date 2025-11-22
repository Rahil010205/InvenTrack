import Link from 'next/link';
import { Table } from '@/components/ui/Table';
import { getAdjustments } from '@/app/actions/inventory';
import { Plus } from 'lucide-react';

export default async function AdjustmentsPage() {
  const adjustments = await getAdjustments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Stock Adjustments</h1>
        <Link
          href="/adjustments/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Link>
      </div>

      <Table
        headers={['ID', 'Product', 'Warehouse', 'Prev Qty', 'New Qty', 'Reason', 'Date']}
        data={adjustments}
        renderRow={(adj) => (
          <tr key={adj.adjustment_id} className="hover:bg-slate-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">#{adj.adjustment_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{adj.product_name} ({adj.product_sku})</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{adj.warehouse_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{adj.previous_qty}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">{adj.new_qty}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{adj.reason}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              {new Date(adj.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
