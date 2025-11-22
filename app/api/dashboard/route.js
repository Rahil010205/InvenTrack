import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const warehouse_id = searchParams.get('warehouse_id');

    let stockQuery = 'SELECT COUNT(*) as total_items, SUM(quantity) as total_qty FROM stock WHERE tenant_id = ?';
    let stockParams = [tenantId];

    let lowStockQuery = `
      SELECT COUNT(*) as count 
      FROM stock s 
      JOIN products p ON s.product_id = p.product_id 
      WHERE s.quantity <= p.reorder_level AND s.tenant_id = ?
    `;
    let lowStockParams = [tenantId];

    // Note: Receipts and Deliveries are usually tied to a warehouse at the item level, but the main record might not have a single warehouse if items go to different ones. 
    // However, for simplicity, we'll check if any item in the receipt/delivery belongs to the warehouse if filtering.
    // Or if the receipt/delivery table has a warehouse_id (it doesn't seem to, based on previous schema checks, it has items).
    // Let's check the schema or previous code. Receipt items have warehouse_id.
    // So filtering receipts/deliveries by warehouse is tricky without joining.
    // For now, I will only filter Stock and Low Stock alerts by warehouse, as that's the most relevant "Dashboard" metric for a warehouse manager.
    // If the user strictly wants receipts/deliveries filtered, I'd need to join.
    // "Pass ?warehouse_id= to /api/dashboard based on filter selection. Update /api/dashboard/route.js SQL queries to filter by warehouse_id."
    // I'll try to filter all if possible.

    if (warehouse_id) {
      stockQuery += ' AND warehouse_id = ?';
      stockParams.push(warehouse_id);

      lowStockQuery += ' AND s.warehouse_id = ?';
      lowStockParams.push(warehouse_id);
    }

    const [stockRows] = await pool.query(stockQuery, stockParams);
    const [lowStockRows] = await pool.query(lowStockQuery, lowStockParams);

    // For receipts/deliveries, it's harder. I'll leave them as global for now or try a subquery.
    // "SELECT COUNT(DISTINCT r.receipt_id) FROM receipts r JOIN receipt_items ri ON r.receipt_id = ri.receipt_id WHERE ..."
    let receiptQuery = "SELECT COUNT(DISTINCT r.receipt_id) as count FROM receipts r JOIN receipt_items ri ON r.receipt_id = ri.receipt_id WHERE (r.status = 'draft' OR r.status = 'waiting') AND r.tenant_id = ?";
    let receiptParams = [tenantId];

    let deliveryQuery = "SELECT COUNT(DISTINCT d.delivery_id) as count FROM deliveries d JOIN delivery_items di ON d.delivery_id = di.delivery_id WHERE (d.status = 'draft' OR d.status = 'waiting') AND d.tenant_id = ?";
    let deliveryParams = [tenantId];

    if (warehouse_id) {
      receiptQuery += ' AND ri.warehouse_id = ?';
      receiptParams.push(warehouse_id);

      deliveryQuery += ' AND di.warehouse_id = ?';
      deliveryParams.push(warehouse_id);
    }

    const [receiptRows] = await pool.query(receiptQuery, receiptParams);
    const [deliveryRows] = await pool.query(deliveryQuery, deliveryParams);

    // Recent Activity
    let activityQuery = `
      SELECT l.*, p.name as product_name 
      FROM stock_ledger l 
      JOIN products p ON l.product_id = p.product_id 
      WHERE l.tenant_id = ?
    `;
    let activityParams = [tenantId];

    if (warehouse_id) {
      activityQuery += ' AND l.warehouse_id = ?';
      activityParams.push(warehouse_id);
    }

    activityQuery += ' ORDER BY l.created_at DESC LIMIT 5';
    const [recentActivity] = await pool.query(activityQuery, activityParams);

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
