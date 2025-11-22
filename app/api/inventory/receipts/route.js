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

    const [rows] = await pool.query(`
      SELECT r.*, u.name as created_by_name 
      FROM receipts r 
      LEFT JOIN users u ON r.created_by = u.user_id 
      WHERE r.tenant_id = ?
      ORDER BY r.created_at DESC
    `, [tenant_id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
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
    const { supplier_name, items } = body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO receipts (tenant_id, supplier_name, created_by, status) VALUES (?, ?, ?, ?)',
        [tenant_id, supplier_name, user_id, 'done']
      );
      const receiptId = result.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO receipt_items (tenant_id, receipt_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?, ?)',
          [tenant_id, receiptId, item.product_id, item.warehouse_id, item.quantity]
        );

        await connection.query(
          `INSERT INTO stock (tenant_id, product_id, warehouse_id, quantity) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [tenant_id, item.product_id, item.warehouse_id, item.quantity, item.quantity]
        );

        await connection.query(
          `INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tenant_id, item.product_id, item.warehouse_id, item.quantity, 'receipt', receiptId]
        );
      }

      await connection.commit();
      return NextResponse.json({ message: 'Receipt created successfully' }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      console.error('Failed to create receipt:', error);
      return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to process receipt request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
