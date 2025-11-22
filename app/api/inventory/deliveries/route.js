import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { tenant_id } = payload;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = `
      SELECT d.*, u.name as created_by_name 
      FROM deliveries d 
      LEFT JOIN users u ON d.created_by = u.user_id 
      WHERE d.tenant_id = ?
    `;
    const params = [tenant_id];

    if (search) {
      query += ` AND d.customer_name LIKE ?`;
      params.push(`%${search}%`);
    }

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY d.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch deliveries:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { tenant_id, sub: user_id } = payload;

    const body = await request.json();
    const { customer_name, items } = body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO deliveries (tenant_id, customer_name, created_by, status) VALUES (?, ?, ?, ?)',
        [tenant_id, customer_name, user_id, 'draft']
      );
      const deliveryId = result.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO delivery_items (tenant_id, delivery_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?, ?)',
          [tenant_id, deliveryId, item.product_id, item.warehouse_id, item.quantity]
        );
      }

      await connection.commit();
      return NextResponse.json({ message: 'Delivery created successfully' }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      console.error('Failed to create delivery:', error);
      return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to process delivery request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
