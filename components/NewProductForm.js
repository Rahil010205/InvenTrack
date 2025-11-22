'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductForm({ categories }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/products');
        router.refresh();
      } else {
        console.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Product Name</label>
        <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-slate-700">SKU / Code</label>
        <input type="text" name="sku" id="sku" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-slate-700">Category</label>
        <select name="category_id" id="category_id" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="unit" className="block text-sm font-medium text-slate-700">Unit of Measure</label>
        <input type="text" name="unit" id="unit" required placeholder="e.g. kg, pcs, box" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label htmlFor="reorder_level" className="block text-sm font-medium text-slate-700">Reorder Level</label>
        <input type="number" name="reorder_level" id="reorder_level" defaultValue="0" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
