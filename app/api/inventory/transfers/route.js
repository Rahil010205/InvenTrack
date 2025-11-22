import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, 
             fw.name as from_warehouse_name, 
             tw.name as to_warehouse_name,
             u.name as created_by_name 
      FROM internal_transfers t 
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.warehouse_id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.warehouse_id
      LEFT JOIN users u ON t.created_by = u.user_id 
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch transfers:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { from_warehouse_id, to_warehouse_id, items } = body;
    const created_by = 1;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO internal_transfers (from_warehouse_id, to_warehouse_id, created_by, status) VALUES (?, ?, ?, ?)',
        [from_warehouse_id, to_warehouse_id, created_by, 'done']
      );
      const transferId = result.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO internal_transfer_items (transfer_id, product_id, quantity) VALUES (?, ?, ?)',
          [transferId, item.product_id, item.quantity]
        );

        await connection.query(
          `UPDATE stock SET quantity = quantity - ? 
           WHERE product_id = ? AND warehouse_id = ?`,
          [item.quantity, item.product_id, from_warehouse_id]
        );

        await connection.query(
          `INSERT INTO stock (product_id, warehouse_id, quantity) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [item.product_id, to_warehouse_id, item.quantity, item.quantity]
        );

        await connection.query(
          `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [item.product_id, from_warehouse_id, -item.quantity, 'transfer', transferId]
        );

        await connection.query(
          `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [item.product_id, to_warehouse_id, item.quantity, 'transfer', transferId]
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
