import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             p.name as product_name, 
             p.sku as product_sku,
             w.name as warehouse_name,
             u.name as created_by_name 
      FROM stock_adjustments a 
      LEFT JOIN products p ON a.product_id = p.product_id
      LEFT JOIN warehouses w ON a.warehouse_id = w.warehouse_id
      LEFT JOIN users u ON a.created_by = u.user_id 
      ORDER BY a.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch adjustments:', error);
    return NextResponse.json({ error: 'Failed to fetch adjustments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, warehouse_id, new_qty, reason } = body;
    const created_by = 1;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [stockRows] = await connection.query(
        'SELECT quantity FROM stock WHERE product_id = ? AND warehouse_id = ?',
        [product_id, warehouse_id]
      );
      const previous_qty = stockRows.length > 0 ? stockRows[0].quantity : 0;
      const quantity_change = new_qty - previous_qty;

      const [result] = await connection.query(
        'INSERT INTO stock_adjustments (product_id, warehouse_id, previous_qty, new_qty, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [product_id, warehouse_id, previous_qty, new_qty, reason, created_by]
      );
      const adjustmentId = result.insertId;

      await connection.query(
        `INSERT INTO stock (product_id, warehouse_id, quantity) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE quantity = ?`,
        [product_id, warehouse_id, new_qty, new_qty]
      );

      await connection.query(
        `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [product_id, warehouse_id, quantity_change, 'adjustment', adjustmentId]
      );

      await connection.commit();
      return NextResponse.json({ message: 'Adjustment created successfully' }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      console.error('Failed to create adjustment:', error);
      return NextResponse.json({ error: 'Failed to create adjustment' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to process adjustment request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
