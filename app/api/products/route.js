import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `
      SELECT 
        p.*, 
        c.name as category_name, 
        COALESCE(SUM(s.quantity), 0) as on_hand,
        (
          SELECT COALESCE(SUM(di.quantity), 0) 
          FROM delivery_items di 
          JOIN deliveries d ON di.delivery_id = d.delivery_id 
          WHERE di.product_id = p.product_id 
          AND d.status IN ('draft', 'waiting', 'ready') 
          AND d.tenant_id = p.tenant_id
        ) as reserved,
        GROUP_CONCAT(CONCAT(w.name, ': ', s.quantity) SEPARATOR '\n') as stock_breakdown
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      LEFT JOIN stock s ON p.product_id = s.product_id AND s.tenant_id = p.tenant_id
      LEFT JOIN warehouses w ON s.warehouse_id = w.warehouse_id
      WHERE p.tenant_id = ?
    `;
    const params = [tenantId];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY p.product_id ORDER BY p.created_at DESC`;

    const [rows] = await pool.query(query, params);
    
    // Calculate free_to_use
    const products = rows.map(row => ({
      ...row,
      free_to_use: Number(row.on_hand) - Number(row.reserved)
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, sku, category_id, unit, reorder_level, cost_price } = body;

    await pool.query(
      'INSERT INTO products (tenant_id, name, sku, category_id, unit, reorder_level, cost_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tenantId, name, sku, category_id || null, unit, reorder_level || 0, cost_price || 0]
    );

    return NextResponse.json({ message: 'Product created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
