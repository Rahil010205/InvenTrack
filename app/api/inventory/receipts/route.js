import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name as created_by_name 
      FROM receipts r 
      LEFT JOIN users u ON r.created_by = u.user_id 
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { supplier_name, items } = body;
    const created_by = 1; // Default user

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO receipts (supplier_name, created_by, status) VALUES (?, ?, ?)',
        [supplier_name, created_by, 'done']
      );
      const receiptId = result.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO receipt_items (receipt_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?)',
          [receiptId, item.product_id, item.warehouse_id, item.quantity]
        );

        await connection.query(
          `INSERT INTO stock (product_id, warehouse_id, quantity) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [item.product_id, item.warehouse_id, item.quantity, item.quantity]
        );

        await connection.query(
          `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [item.product_id, item.warehouse_id, item.quantity, 'receipt', receiptId]
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
