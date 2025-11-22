import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { tenant_id } = payload;

    const { id } = await params;

    // Fetch receipt details
    const [receiptRows] = await pool.query(
      `SELECT r.*, u.name as created_by_name 
       FROM receipts r 
       LEFT JOIN users u ON r.created_by = u.user_id 
       WHERE r.receipt_id = ? AND r.tenant_id = ?`,
      [id, tenant_id]
    );

    if (receiptRows.length === 0) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const receipt = receiptRows[0];

    // Fetch receipt items
    const [itemRows] = await pool.query(
      `SELECT ri.*, p.name as product_name, p.sku, w.name as warehouse_name 
       FROM receipt_items ri 
       JOIN products p ON ri.product_id = p.product_id 
       JOIN warehouses w ON ri.warehouse_id = w.warehouse_id 
       WHERE ri.receipt_id = ? AND ri.tenant_id = ?`,
      [id, tenant_id]
    );

    return NextResponse.json({ ...receipt, items: itemRows });
  } catch (error) {
    console.error('Failed to fetch receipt:', error);
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 });
  }
}
