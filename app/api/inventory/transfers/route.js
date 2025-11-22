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
      SELECT t.*, 
             fw.name as from_warehouse_name, 
             tw.name as to_warehouse_name,
             u.name as created_by_name 
      FROM internal_transfers t 
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.warehouse_id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.warehouse_id
      LEFT JOIN users u ON t.created_by = u.user_id 
      WHERE t.tenant_id = ?
      ORDER BY t.created_at DESC
    `, [tenant_id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch transfers:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
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
    const { from_warehouse_id, to_warehouse_id, items } = body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO internal_transfers (tenant_id, from_warehouse_id, to_warehouse_id, created_by, status) VALUES (?, ?, ?, ?, ?)',
        [tenant_id, from_warehouse_id, to_warehouse_id, user_id, 'done']
      );
      const transferId = result.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO internal_transfer_items (tenant_id, transfer_id, product_id, quantity) VALUES (?, ?, ?, ?)',
          [tenant_id, transferId, item.product_id, item.quantity]
        );

        await connection.query(
          `UPDATE stock SET quantity = quantity - ? 
           WHERE product_id = ? AND warehouse_id = ? AND tenant_id = ?`,
          [item.quantity, item.product_id, from_warehouse_id, tenant_id]
        );

        await connection.query(
          `INSERT INTO stock (tenant_id, product_id, warehouse_id, quantity) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [tenant_id, item.product_id, to_warehouse_id, item.quantity, item.quantity]
        );

        await connection.query(
          `INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tenant_id, item.product_id, from_warehouse_id, -item.quantity, 'transfer', transferId]
        );

        await connection.query(
          `INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tenant_id, item.product_id, to_warehouse_id, item.quantity, 'transfer', transferId]
        );
      }

      await connection.commit();
      return NextResponse.json({ message: 'Transfer created successfully' }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      console.error('Failed to create transfer:', error);
      return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to process transfer request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
