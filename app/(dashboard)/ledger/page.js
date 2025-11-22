import { Table } from '@/components/ui/Table';
import { getStockLedger } from '@/app/actions/inventory';

export default async function LedgerPage() {
  const ledger = await getStockLedger();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Stock Ledger (Move History)</h1>

      <Table
        headers={['ID', 'Date', 'Product', 'Warehouse', 'Change', 'Source', 'Source ID']}
        data={ledger}
        renderRow={(entry) => (
          <tr key={entry.ledger_id} className="hover:bg-slate-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">#{entry.ledger_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              {new Date(entry.created_at).toLocaleString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{entry.product_name} ({entry.product_sku})</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{entry.warehouse_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold">
              <span className={entry.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}>
                {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 capitalize">{entry.source_type}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">#{entry.source_id}</td>
          </tr>
        )}
      />
    </div>
  );
}
