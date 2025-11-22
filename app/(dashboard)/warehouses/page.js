'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Table from '@/components/ui/Table';
import { Plus, Edit, Trash2, Warehouse } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/inventory/warehouses');
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = '/api/inventory/warehouses';
      const method = editing ? 'PUT' : 'POST';
      const body = editing 
        ? { warehouse_id: editing.warehouse_id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        setFormData({ name: '', location: '' });
        fetchWarehouses();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save warehouse');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (warehouse) => {
    setEditing(warehouse);
    setFormData({ name: warehouse.name, location: warehouse.location || '' });
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (warehouse_id) => {
    if (!confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/inventory/warehouses?id=${warehouse_id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchWarehouses();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete warehouse');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ name: '', location: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Warehouses</h1>
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Warehouses</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ name: '', location: '' });
            setError('');
          }}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </button>
      </div>

  {showForm && (
  <div
    className="
      rounded-xl
      border border-border
      bg-card
      p-8 shadow-md
      transition-colors
    "
  >
    <h2 className="text-xl font-semibold text-foreground mb-6">
      {editing ? 'Edit Warehouse' : 'Add New Warehouse'}
    </h2>

    {error && (
      <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Warehouse Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="
            w-full px-4 py-2 rounded-md
            bg-background
            border border-border
            text-foreground
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary
            transition-colors
          "
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="
            w-full px-4 py-2 rounded-md
            bg-background
            border border-border
            text-foreground
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary
            transition-colors
          "
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
  type="button"
  onClick={handleCancel}
  className="
    rounded-md px-4 py-2 text-sm font-medium
    bg-slate-700 text-white
    hover:bg-slate-800
    transition-colors
    dark:bg-slate-600 dark:hover:bg-slate-700
  "
>
  Cancel
</button>

        <button
  type="submit"
  className="
    rounded-md px-4 py-2 text-sm font-medium
    bg-blue-600 text-white
    hover:bg-blue-700
    transition-colors
  "
>
  {editing ? 'Update' : 'Create'} Warehouse
</button>

      </div>
    </form>
  </div>
)}



      <Table
        headers={['Name', 'Location', 'Created At', 'Actions']}
        data={warehouses}
        renderRow={(warehouse) => (
          <tr key={warehouse.warehouse_id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
  {warehouse.name}
</td>
<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
  {warehouse.location || '-'}
</td>
<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
  {new Date(warehouse.created_at).toLocaleDateString()}
</td>


            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEdit(warehouse)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                  aria-label="Edit warehouse"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(warehouse.warehouse_id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  aria-label="Delete warehouse"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

