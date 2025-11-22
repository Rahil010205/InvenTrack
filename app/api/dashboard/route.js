import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [stockRows] = await pool.query('SELECT COUNT(*) as total_items, SUM(quantity) as total_qty FROM stock WHERE tenant_id = ?', [tenantId]);
    const [lowStockRows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM stock s 
      JOIN products p ON s.product_id = p.product_id 
      WHERE s.quantity <= p.reorder_level AND s.tenant_id = ?
    `, [tenantId]);
    const [receiptRows] = await pool.query("SELECT COUNT(*) as count FROM receipts WHERE (status = 'draft' OR status = 'waiting') AND tenant_id = ?", [tenantId]);
    const [deliveryRows] = await pool.query("SELECT COUNT(*) as count FROM deliveries WHERE (status = 'draft' OR status = 'waiting') AND tenant_id = ?", [tenantId]);

    // Recent Activity (Ledger)
    const [recentActivity] = await pool.query(`
      SELECT l.*, p.name as product_name 
      FROM stock_ledger l 
      JOIN products p ON l.product_id = p.product_id 
      WHERE l.tenant_id = ?
      ORDER BY l.created_at DESC 
      LIMIT 5
    `, [tenantId]);

    return NextResponse.json({
      totalItems: stockRows[0].total_items || 0,
      totalQty: stockRows[0].total_qty || 0,
      lowStock: lowStockRows[0].count || 0,
      pendingReceipts: receiptRows[0].count || 0,
      pendingDeliveries: deliveryRows[0].count || 0,
      recentActivity
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
