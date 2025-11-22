import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ViewSwitcher from '@/components/ViewSwitcher';
import ValidateButton from '@/components/ValidateButton';
import SearchFilterBar from '@/components/SearchFilterBar';
import PrintReceiptButton from '@/components/PrintReceiptButton';
import Table from '@/components/ui/Table';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export default async function ReceiptsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || '';
  const status = params?.status || '';
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (status) query.set('status', status);

  const receipts = await fetchAPI(`/inventory/receipts?${query.toString()}`);

  // Get current user name for the print button
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token);
  const userName = payload?.name || 'User';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Receipts</h1>
        <Link
          href="/receipts/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Link>
      </div>

      <SearchFilterBar placeholder="Search supplier..." statusOptions={['draft', 'done', 'cancelled']} />
      {/* <ViewSwitcher items={receipts} type="receipt" /> */}
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
              <div className="flex items-center gap-2">
                {receipt.status === 'draft' && (
                  <ValidateButton
                    id={receipt.receipt_id}
                    type="receipts"
                    currentStatus={receipt.status}
                  />
                )}
                {receipt.status === 'done' && (
                  <PrintReceiptButton receiptId={receipt.receipt_id} userName={userName} />
                )}
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
