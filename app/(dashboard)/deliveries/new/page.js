import { getProducts } from '@/app/actions/product';
import { getWarehouses } from '@/app/actions/inventory';
import NewDeliveryForm from '@/components/NewDeliveryForm';

export default async function NewDeliveryPage() {
  const products = await getProducts();
  const warehouses = await getWarehouses();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create New Delivery</h1>
      <NewDeliveryForm products={products} warehouses={warehouses} />
    </div>
  );
}
