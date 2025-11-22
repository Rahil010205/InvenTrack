import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows] = await pool.query('SELECT * FROM categories WHERE tenant_id = ? ORDER BY name', [tenantId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (tenant_id, name) VALUES (?, ?)',
      [tenantId, name]
    );

    return NextResponse.json({ message: 'Category created successfully', id: result.insertId }, { status: 201 });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { category_id, name } = body;

    if (!category_id || !name) {
      return NextResponse.json({ error: 'Category ID and name are required' }, { status: 400 });
    }

    // Verify category belongs to tenant
    const [category] = await pool.query(
      'SELECT * FROM categories WHERE category_id = ? AND tenant_id = ?',
      [category_id, tenantId]
    );

    if (category.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await pool.query(
      'UPDATE categories SET name = ? WHERE category_id = ? AND tenant_id = ?',
      [name, category_id, tenantId]
    );

    return NextResponse.json({ message: 'Category updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('id');

    if (!category_id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Verify category belongs to tenant
    const [category] = await pool.query(
      'SELECT * FROM categories WHERE category_id = ? AND tenant_id = ?',
      [category_id, tenantId]
    );

    if (category.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category is used in products
    const [productCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [category_id]
    );
    
    if (productCheck[0].count > 0) {
      return NextResponse.json({ error: 'Cannot delete category with associated products' }, { status: 400 });
    }

    await pool.query(
      'DELETE FROM categories WHERE category_id = ? AND tenant_id = ?',
      [category_id, tenantId]
    );

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}