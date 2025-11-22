import { getProducts } from '@/app/actions/product';
import { getWarehouses } from '@/app/actions/inventory';
import NewReceiptForm from '@/components/NewReceiptForm';

export default async function NewReceiptPage() {
  const products = await getProducts();
  const warehouses = await getWarehouses();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create New Receipt</h1>
      <NewReceiptForm products={products} warehouses={warehouses} />
    </div>
  );
}
