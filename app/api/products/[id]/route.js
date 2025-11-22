import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const tenantId = await getTenantId(request);
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [rows] = await pool.query(
            'SELECT * FROM products WHERE product_id = ? AND tenant_id = ?',
            [id, tenantId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const tenantId = await getTenantId(request);
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, sku, category_id, unit, reorder_level, cost_price } = body;

        await pool.query(
            'UPDATE products SET name = ?, sku = ?, category_id = ?, unit = ?, reorder_level = ?, cost_price = ? WHERE product_id = ? AND tenant_id = ?',
            [name, sku, category_id || null, unit, reorder_level || 0, cost_price || 0, id, tenantId]
        );

        return NextResponse.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Failed to update product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}
