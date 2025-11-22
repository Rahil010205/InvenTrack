'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

export default function NewTransferForm({ products, warehouses }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const from_warehouse_id = formData.get('from_warehouse_id');
    const to_warehouse_id = formData.get('to_warehouse_id');

    try {
      const res = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_warehouse_id, to_warehouse_id, items }),
      });

      if (res.ok) {
        router.push('/transfers');
        router.refresh();
      } else {
        console.error('Failed to create transfer');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-xl border border-border shadow-sm transition-colors">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="from_warehouse_id" className="block text-sm font-medium text-foreground">From Warehouse</label>
          <select name="from_warehouse_id" id="from_warehouse_id" required className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
            <option value="">Select Source</option>
            {warehouses.map((w) => (
              <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="to_warehouse_id" className="block text-sm font-medium text-foreground">To Warehouse</label>
          <select name="to_warehouse_id" id="to_warehouse_id" required className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
            <option value="">Select Destination</option>
            {warehouses.map((w) => (
              <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Items to Transfer</h3>
          <button type="button" onClick={addItem} className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 items-end border-b border-border pb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground">Product</label>
              <select
                required
                value={item.product_id}
                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium text-foreground">Qty</label>
              <input
                type="number"
                required
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <button type="button" onClick={() => removeItem(index)} className="mb-2 text-destructive hover:text-destructive/80 transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
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
          {loading ? 'Creating...' : 'Create Transfer'}
        </button>
      </div>
    </form>
  );
}
