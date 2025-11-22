import { fetchAPI } from '@/lib/api';
import NewReceiptForm from '@/components/NewReceiptForm';

export default async function NewReceiptPage() {
  const products = await fetchAPI('/products');
  const warehouses = await fetchAPI('/inventory/warehouses');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create New Receipt</h1>
      <NewReceiptForm products={products} warehouses={warehouses} />
    </div>
  );
}
