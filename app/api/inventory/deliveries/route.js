import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, u.name as created_by_name 
      FROM deliveries d 
      LEFT JOIN users u ON d.created_by = u.user_id 
      ORDER BY d.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch deliveries:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_name, items } = body;
    const created_by = 1; 

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO deliveries (customer_name, created_by, status) VALUES (?, ?, ?)',
        [customer_name, created_by, 'done']
      );
      const deliveryId = result.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO delivery_items (delivery_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?)',
          [deliveryId, item.product_id, item.warehouse_id, item.quantity]
        );

        await connection.query(
          `UPDATE stock SET quantity = quantity - ? 
           WHERE product_id = ? AND warehouse_id = ?`,
          [item.quantity, item.product_id, item.warehouse_id]
        );

        await connection.query(
          `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [item.product_id, item.warehouse_id, -item.quantity, 'delivery', deliveryId]
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
