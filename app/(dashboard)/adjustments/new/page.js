import { getProducts } from '@/app/actions/product';
import { getWarehouses } from '@/app/actions/inventory';
import NewAdjustmentForm from '@/components/NewAdjustmentForm';

export default async function NewAdjustmentPage() {
  const products = await getProducts();
  const warehouses = await getWarehouses();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Stock Adjustment</h1>
      <NewAdjustmentForm products={products} warehouses={warehouses} />
    </div>
  );
}
