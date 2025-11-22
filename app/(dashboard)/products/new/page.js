import { fetchAPI } from '@/lib/api';
import NewProductForm from '@/components/NewProductForm';

export default async function NewProductPage() {
  const categories = await fetchAPI('/categories');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create New Product</h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
