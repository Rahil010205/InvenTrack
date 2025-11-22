import Link from 'next/link';
import { Table } from '@/components/ui/Table';
import { getProducts } from '@/app/actions/product';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <Link
          href="/products/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </div>

      <Table
        headers={['Name', 'SKU', 'Category', 'Unit', 'Reorder Level', 'Created At']}
        data={products}
        renderRow={(product) => (
          <tr key={product.product_id} className="hover:bg-slate-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{product.name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.sku}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.category_name || '-'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.unit}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.reorder_level}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
              {new Date(product.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
