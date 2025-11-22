import { fetchAPI } from '@/lib/api';
import NewTransferForm from '@/components/NewTransferForm';

export default async function NewTransferPage() {
  const products = await fetchAPI('/products');
  const warehouses = await fetchAPI('/inventory/warehouses');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create New Transfer</h1>
      <NewTransferForm products={products} warehouses={warehouses} />
    </div>
  );
}
