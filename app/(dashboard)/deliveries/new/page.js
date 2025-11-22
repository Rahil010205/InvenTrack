import { fetchAPI } from '@/lib/api';
import NewDeliveryForm from '@/components/NewDeliveryForm';

export default async function NewDeliveryPage() {
  const products = await fetchAPI('/products');
  const warehouses = await fetchAPI('/inventory/warehouses');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Create New Delivery</h1>
      <NewDeliveryForm products={products} warehouses={warehouses} />
    </div>
  );
}
