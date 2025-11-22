import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, 
             p.name as product_name, 
             p.sku as product_sku,
             w.name as warehouse_name
      FROM stock_ledger l 
      LEFT JOIN products p ON l.product_id = p.product_id
      LEFT JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      ORDER BY l.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch ledger:', error);
    return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
