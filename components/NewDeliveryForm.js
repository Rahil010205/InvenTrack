'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

export default function NewDeliveryForm({ products, warehouses }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ product_id: '', warehouse_id: '', quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { product_id: '', warehouse_id: '', quantity: 1 }]);
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
    const customer_name = formData.get('customer_name');

    try {
      const res = await fetch('/api/inventory/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name, items }),
      });

      if (res.ok) {
        router.push('/deliveries');
        router.refresh();
      } else {
        console.error('Failed to create delivery');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-xl border border-border shadow-sm transition-colors">
      <div>
        <label htmlFor="customer_name" className="block text-sm font-medium text-foreground">Customer Name</label>
        <input type="text" name="customer_name" id="customer_name" required className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Items</h3>
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

            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground">Warehouse</label>
              <select
                required
                value={item.warehouse_id}
                onChange={(e) => updateItem(index, 'warehouse_id', e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
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
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Delivery'}
        </button>
      </div>
    </form>
  );
}
