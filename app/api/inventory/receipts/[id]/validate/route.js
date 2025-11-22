import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { tenant_id } = payload;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check if receipt exists and is in draft status
            const [receipts] = await connection.query(
                'SELECT * FROM receipts WHERE receipt_id = ? AND tenant_id = ?',
                [id, tenant_id]
            );

            if (receipts.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
            }

            const receipt = receipts[0];
            if (receipt.status !== 'draft') {
                await connection.rollback();
                return NextResponse.json({ error: 'Receipt is already validated or cancelled' }, { status: 400 });
            }

            // 2. Get receipt items
            const [items] = await connection.query(
                'SELECT * FROM receipt_items WHERE receipt_id = ? AND tenant_id = ?',
                [id, tenant_id]
            );

            // 3. Update stock and ledger
            for (const item of items) {
                await connection.query(
                    `INSERT INTO stock (tenant_id, product_id, warehouse_id, quantity) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
                    [tenant_id, item.product_id, item.warehouse_id, item.quantity, item.quantity]
                );

                await connection.query(
                    `INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [tenant_id, item.product_id, item.warehouse_id, item.quantity, 'receipt', id]
                );
            }

            // 4. Update receipt status
            await connection.query(
                'UPDATE receipts SET status = ? WHERE receipt_id = ?',
                ['done', id]
            );

            await connection.commit();
            return NextResponse.json({ message: 'Receipt validated successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Failed to validate receipt:', error);
            return NextResponse.json({ error: 'Failed to validate receipt' }, { status: 500 });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Failed to process validation request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
