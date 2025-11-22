import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';
import ViewSwitcher from '@/components/ViewSwitcher';
import ValidateButton from '@/components/ValidateButton';
import SearchFilterBar from '@/components/SearchFilterBar';

export default async function ReceiptsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || '';
  const status = params?.status || '';
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const receipts = await fetchAPI(`/inventory/receipts${queryString}`);

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

      <SearchFilterBar placeholder="Search supplier..." statusOptions={['draft', 'done', 'cancelled']} />
      {/*<ViewSwitcher items={receipts} type="receipt" />*/}
      <Table
        headers={['ID', 'Supplier', 'Status', 'Created By', 'Date', 'Actions']}
        data={receipts}
        renderRow={(receipt) => (
          <tr key={receipt.receipt_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">#{receipt.receipt_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{receipt.supplier_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              <span className="
  inline-flex items-center rounded-full 
  bg-blue-600 text-white
  px-2.5 py-0.5 text-xs font-medium
  dark:bg-green-400 dark:text-green-900
  transition-colors
">
                {receipt.status}
              </span>

            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{receipt.created_by_name || 'Unknown'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(receipt.created_at).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {receipt.status === 'draft' && (
                <ValidateButton id={receipt.receipt_id} type="receipts" />
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
