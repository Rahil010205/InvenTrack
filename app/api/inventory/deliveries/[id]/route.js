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

    // Fetch delivery details
    const [deliveryRows] = await pool.query(
      `SELECT d.*, u.name as created_by_name 
       FROM deliveries d 
       LEFT JOIN users u ON d.created_by = u.user_id 
       WHERE d.delivery_id = ? AND d.tenant_id = ?`,
      [id, tenant_id]
    );

    if (deliveryRows.length === 0) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    const delivery = deliveryRows[0];

    // Fetch delivery items
    const [itemRows] = await pool.query(
      `SELECT di.*, p.name as product_name, p.sku, w.name as warehouse_name 
       FROM delivery_items di 
       JOIN products p ON di.product_id = p.product_id 
       JOIN warehouses w ON di.warehouse_id = w.warehouse_id 
       WHERE di.delivery_id = ? AND di.tenant_id = ?`,
      [id, tenant_id]
    );

    return NextResponse.json({ ...delivery, items: itemRows });
  } catch (error) {
    console.error('Failed to fetch delivery:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery' }, { status: 500 });
  }
}
