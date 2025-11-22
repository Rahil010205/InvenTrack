'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    fetch(`/api/products/${id}`),
                    fetch('/api/categories')
                ]);

                if (productRes.ok) {
                    const productData = await productRes.json();
                    setProduct(productData);
                } else {
                    alert('Failed to fetch product');
                    router.push('/products');
                }

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    setCategories(categoriesData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/products');
                router.refresh();
            } else {
                alert('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!product) {
        return <div className="p-6">Product not found</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/products" className="p-2 hover:bg-accent rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm transition-colors">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={product.name}
                        required
                        className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-foreground">SKU / Code</label>
                    <input
                        type="text"
                        name="sku"
                        id="sku"
                        defaultValue={product.sku}
                        required
                        className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-foreground">Category</label>
                    <select
                        name="category_id"
                        id="category_id"
                        defaultValue={product.category_id || ''}
                        className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-foreground">Unit of Measure</label>
                    <input
                        type="text"
                        name="unit"
                        id="unit"
                        defaultValue={product.unit}
                        required
                        placeholder="e.g. kg, pcs, box"
                        className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="reorder_level" className="block text-sm font-medium text-foreground">Reorder Level</label>
                    <input
                        type="number"
                        name="reorder_level"
                        id="reorder_level"
                        defaultValue={product.reorder_level}
                        className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="cost_price" className="block text-sm font-medium text-foreground">Cost Price</label>
                    <input
                        type="number"
                        name="cost_price"
                        id="cost_price"
                        defaultValue={product.cost_price || 0}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Saving...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
