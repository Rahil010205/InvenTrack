import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';

export default async function AdjustmentsPage() {
  const adjustments = await fetchAPI('/inventory/adjustments');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Stock Adjustments</h1>
        <Link
          href="/adjustments/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Link>
      </div>

      <Table
        headers={['ID', 'Product', 'Warehouse', 'Prev Qty', 'New Qty', 'Reason', 'Date']}
        data={adjustments}
        renderRow={(adj) => (
          <tr key={adj.adjustment_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">#{adj.adjustment_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{adj.product_name} ({adj.product_sku})</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{adj.warehouse_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{adj.previous_qty}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">{adj.new_qty}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{adj.reason}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(adj.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
