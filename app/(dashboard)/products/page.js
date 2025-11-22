import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus, Edit, Info } from 'lucide-react';
import Table from '@/components/ui/Table';
import SearchFilterBar from '@/components/SearchFilterBar';

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || '';
  const query = search ? `?search=${search}` : '';
  const products = await fetchAPI(`/products${query}`);

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

      <SearchFilterBar placeholder="Search products..." />

      <Table
        headers={['Name', 'SKU', 'Category', 'Unit', 'Reorder Level', 'Stock', 'Created At', 'Actions']}
        data={products}
        renderRow={(product) => (
          <tr key={product.product_id} className="hover:bg-accent transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.category_name || '-'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.unit}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.reorder_level}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{product.reorder_level}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{product.total_stock}</span>
                {product.stock_breakdown && (
                  <div className="group relative">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border whitespace-pre-wrap z-10">
                      {product.stock_breakdown}
                    </div>
                  </div>
                )}
              </div>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              {new Date(product.created_at).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
              <Link href={`/products/${product.product_id}`} className="text-primary hover:text-primary/80 transition-colors">
                <Edit className="h-4 w-4" />
              </Link>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
