import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';

export default async function ReceiptsPage() {
  const receipts = await fetchAPI('/inventory/receipts');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Receipts (Incoming)</h1>
        <Link
          href="/receipts/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Receipt
        </Link>
      </div>

      <Table
        headers={['ID', 'Supplier', 'Status', 'Created By', 'Date']}
        data={receipts}
        renderRow={(receipt) => (
          <tr key={receipt.receipt_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">#{receipt.receipt_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{receipt.supplier_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                {receipt.status}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{receipt.created_by_name || 'Unknown'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(receipt.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
