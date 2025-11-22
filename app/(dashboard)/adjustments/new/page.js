import { fetchAPI } from '@/lib/api';
import NewAdjustmentForm from '@/components/NewAdjustmentForm';

export default async function NewAdjustmentPage() {
  const products = await fetchAPI('/products');
  const warehouses = await fetchAPI('/inventory/warehouses');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Stock Adjustment</h1>
      <NewAdjustmentForm products={products} warehouses={warehouses} />
    </div>
  );
}
