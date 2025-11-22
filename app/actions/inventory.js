'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- RECEIPTS ---

export async function getReceipts() {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name as created_by_name 
      FROM receipts r 
      LEFT JOIN users u ON r.created_by = u.user_id 
      ORDER BY r.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return [];
  }
}

export async function createReceipt(formData) {
  const supplier_name = formData.get('supplier_name');
  // In a real app, we'd get the user ID from the session
  const created_by = 1; // Default to admin/first user for now

  // We need to parse the items from the form data. 
  // For simplicity in this MVP, we'll assume a single item or handle it via a JSON string if complex.
  // But standard form submission is tricky for nested lists. 
  // We'll use a simplified approach: The form will submit a JSON string for 'items'.
  const itemsJson = formData.get('items');
  const items = JSON.parse(itemsJson);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO receipts (supplier_name, created_by, status) VALUES (?, ?, ?)',
      [supplier_name, created_by, 'done'] // Auto-validate for MVP
    );
    const receiptId = result.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO receipt_items (receipt_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?)',
        [receiptId, item.product_id, item.warehouse_id, item.quantity]
      );

      // Update Stock
      await connection.query(
        `INSERT INTO stock (product_id, warehouse_id, quantity) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [item.product_id, item.warehouse_id, item.quantity, item.quantity]
      );

      // Log to Ledger
      await connection.query(
        `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [item.product_id, item.warehouse_id, item.quantity, 'receipt', receiptId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create receipt:', error);
    return { message: 'Failed to create receipt' };
  } finally {
    connection.release();
  }

  revalidatePath('/receipts');
  revalidatePath('/dashboard');
  revalidatePath('/products');
  redirect('/receipts');
}

export async function getWarehouses() {
  try {
    const [rows] = await pool.query('SELECT * FROM warehouses ORDER BY name');
    return rows;
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return [];
  }
}

// --- DELIVERIES ---

export async function getDeliveries() {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, u.name as created_by_name 
      FROM deliveries d 
      LEFT JOIN users u ON d.created_by = u.user_id 
      ORDER BY d.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Failed to fetch deliveries:', error);
    return [];
  }
}

export async function createDelivery(formData) {
  const customer_name = formData.get('customer_name');
  const created_by = 1; 
  const itemsJson = formData.get('items');
  const items = JSON.parse(itemsJson);

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

      // Update Stock (Decrease)
      await connection.query(
        `UPDATE stock SET quantity = quantity - ? 
         WHERE product_id = ? AND warehouse_id = ?`,
        [item.quantity, item.product_id, item.warehouse_id]
      );

      // Log to Ledger
      await connection.query(
        `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [item.product_id, item.warehouse_id, -item.quantity, 'delivery', deliveryId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create delivery:', error);
    return { message: 'Failed to create delivery' };
  } finally {
    connection.release();
  }

  revalidatePath('/deliveries');
  revalidatePath('/dashboard');
  revalidatePath('/products');
  redirect('/deliveries');
}

// --- TRANSFERS ---

export async function getTransfers() {
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
    return rows;
  } catch (error) {
    console.error('Failed to fetch transfers:', error);
    return [];
  }
}

export async function createTransfer(formData) {
  const from_warehouse_id = formData.get('from_warehouse_id');
  const to_warehouse_id = formData.get('to_warehouse_id');
  const created_by = 1;
  const itemsJson = formData.get('items');
  const items = JSON.parse(itemsJson);

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

      // Decrease from Source
      await connection.query(
        `UPDATE stock SET quantity = quantity - ? 
         WHERE product_id = ? AND warehouse_id = ?`,
        [item.quantity, item.product_id, from_warehouse_id]
      );

      // Increase in Destination
      await connection.query(
        `INSERT INTO stock (product_id, warehouse_id, quantity) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [item.product_id, to_warehouse_id, item.quantity, item.quantity]
      );

      // Log to Ledger (Out)
      await connection.query(
        `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [item.product_id, from_warehouse_id, -item.quantity, 'transfer', transferId]
      );

      // Log to Ledger (In)
      await connection.query(
        `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [item.product_id, to_warehouse_id, item.quantity, 'transfer', transferId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create transfer:', error);
    return { message: 'Failed to create transfer' };
  } finally {
    connection.release();
  }

  revalidatePath('/transfers');
  revalidatePath('/dashboard');
  revalidatePath('/products');
  redirect('/transfers');
}

// --- ADJUSTMENTS ---

export async function getAdjustments() {
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
    return rows;
  } catch (error) {
    console.error('Failed to fetch adjustments:', error);
    return [];
  }
}

export async function createAdjustment(formData) {
  const product_id = formData.get('product_id');
  const warehouse_id = formData.get('warehouse_id');
  const new_qty = parseInt(formData.get('new_qty'));
  const reason = formData.get('reason');
  const created_by = 1;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get current quantity
    const [stockRows] = await connection.query(
      'SELECT quantity FROM stock WHERE product_id = ? AND warehouse_id = ?',
      [product_id, warehouse_id]
    );
    const previous_qty = stockRows.length > 0 ? stockRows[0].quantity : 0;
    const quantity_change = new_qty - previous_qty;

    // Insert Adjustment Record
    const [result] = await connection.query(
      'INSERT INTO stock_adjustments (product_id, warehouse_id, previous_qty, new_qty, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, warehouse_id, previous_qty, new_qty, reason, created_by]
    );
    const adjustmentId = result.insertId;

    // Update Stock
    await connection.query(
      `INSERT INTO stock (product_id, warehouse_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = ?`,
      [product_id, warehouse_id, new_qty, new_qty]
    );

    // Log to Ledger
    await connection.query(
      `INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [product_id, warehouse_id, quantity_change, 'adjustment', adjustmentId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create adjustment:', error);
    return { message: 'Failed to create adjustment' };
  } finally {
    connection.release();
  }

  revalidatePath('/adjustments');
  revalidatePath('/dashboard');
  revalidatePath('/products');
  redirect('/adjustments');
}

// --- LEDGER ---

export async function getStockLedger() {
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
    return rows;
  } catch (error) {
    console.error('Failed to fetch ledger:', error);
    return [];
  }
}
