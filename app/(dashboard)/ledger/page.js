import { fetchAPI } from '@/lib/api';
import Table from '@/components/ui/Table';

export default async function LedgerPage() {
  const ledger = await fetchAPI('/ledger');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Stock Ledger (Move History)</h1>

      <Table
        headers={['ID', 'Date', 'Product', 'Warehouse', 'Change', 'Source', 'Source ID']}
        data={ledger}
        renderRow={(entry) => (
          <tr key={entry.ledger_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">#{entry.ledger_id}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(entry.created_at).toLocaleString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{entry.product_name} ({entry.product_sku})</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{entry.warehouse_name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold">
              <span className={entry.quantity_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground capitalize">{entry.source_type}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">#{entry.source_id}</td>
          </tr>
        )}
      />
    </div>
  );
}
