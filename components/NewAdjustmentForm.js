'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAdjustmentForm({ products, warehouses }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.new_qty = parseInt(data.new_qty);

    try {
      const res = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/adjustments');
        router.refresh();
      } else {
        console.error('Failed to create adjustment');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm transition-colors">
      <div>
        <label htmlFor="product_id" className="block text-sm font-medium text-foreground">Product</label>
        <select name="product_id" id="product_id" required className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="warehouse_id" className="block text-sm font-medium text-foreground">Warehouse</label>
        <select name="warehouse_id" id="warehouse_id" required className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="new_qty" className="block text-sm font-medium text-foreground">New Quantity</label>
        <input type="number" name="new_qty" id="new_qty" required min="0" className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        <p className="mt-1 text-sm text-muted-foreground">Enter the actual quantity counted in the warehouse.</p>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-foreground">Reason</label>
        <textarea name="reason" id="reason" rows="3" required className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"></textarea>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 
           dark:bg-blue-500 dark:hover:bg-blue-600
           focus:outline-none focus:ring-2 focus:ring-blue-500
           disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Adjustment'}
        </button>
      </div>
    </form>
  );
}
