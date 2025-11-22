import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Table from '@/components/ui/Table';

export default async function ProductsPage() {
  const products = await fetchAPI('/products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Link
          href="/products/new"
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </div>

      <Table
        headers={['Name', 'SKU', 'Category', 'Unit', 'Reorder Level', 'Created At']}
        data={products}
        renderRow={(product) => (
          <tr key={product.product_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.category_name || '-'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.unit}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.reorder_level}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(product.created_at).toLocaleDateString()}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
