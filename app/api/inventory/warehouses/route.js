import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows] = await pool.query('SELECT * FROM warehouses WHERE tenant_id = ? ORDER BY name', [tenantId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, location } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO warehouses (tenant_id, name, location) VALUES (?, ?, ?)',
      [tenantId, name, location || null]
    );

    return NextResponse.json({ message: 'Warehouse created successfully', id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create warehouse:', error);
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { warehouse_id, name, location } = body;

    if (!warehouse_id || !name) {
      return NextResponse.json({ error: 'Warehouse ID and name are required' }, { status: 400 });
    }

    // Verify warehouse belongs to tenant
    const [warehouse] = await pool.query(
      'SELECT * FROM warehouses WHERE warehouse_id = ? AND tenant_id = ?',
      [warehouse_id, tenantId]
    );

    if (warehouse.length === 0) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    await pool.query(
      'UPDATE warehouses SET name = ?, location = ? WHERE warehouse_id = ? AND tenant_id = ?',
      [name, location || null, warehouse_id, tenantId]
    );

    return NextResponse.json({ message: 'Warehouse updated successfully' });
  } catch (error) {
    console.error('Failed to update warehouse:', error);
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const warehouse_id = searchParams.get('id');

    if (!warehouse_id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 });
    }

    // Verify warehouse belongs to tenant
    const [warehouse] = await pool.query(
      'SELECT * FROM warehouses WHERE warehouse_id = ? AND tenant_id = ?',
      [warehouse_id, tenantId]
    );

    if (warehouse.length === 0) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Check if warehouse is used in stock, receipts, deliveries, or transfers
    const [stockCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM stock WHERE warehouse_id = ?',
      [warehouse_id]
    );
    
    if (stockCheck[0].count > 0) {
      return NextResponse.json({ error: 'Cannot delete warehouse with existing stock' }, { status: 400 });
    }

    await pool.query(
      'DELETE FROM warehouses WHERE warehouse_id = ? AND tenant_id = ?',
      [warehouse_id, tenantId]
    );

    return NextResponse.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Failed to delete warehouse:', error);
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 });
  }
}