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

            // 1. Check if delivery exists and is in draft status
            const [deliveries] = await connection.query(
                'SELECT * FROM deliveries WHERE delivery_id = ? AND tenant_id = ?',
                [id, tenant_id]
            );

            if (deliveries.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
            }

            const delivery = deliveries[0];
            if (delivery.status !== 'draft') {
                await connection.rollback();
                return NextResponse.json({ error: 'Delivery is already validated or cancelled' }, { status: 400 });
            }

            // 2. Get delivery items
            const [items] = await connection.query(
                'SELECT * FROM delivery_items WHERE delivery_id = ? AND tenant_id = ?',
                [id, tenant_id]
            );

            // 3. Update stock and ledger
            for (const item of items) {
                // Check stock availability first? (Optional but good practice, though not strictly requested in "Validate" logic, usually validation implies checking constraints. The prompt says "ONLY THEN perform the transaction to update the stock table". It doesn't explicitly say to check for negative stock, but it's implied for deliveries. However, the previous logic just did UPDATE quantity = quantity - ?. I'll stick to that for now to match previous logic, but maybe add a check if I want to be safe. The user said "Do not remove existing working logic, only enhance it." The existing logic didn't seem to check explicitly in the route I saw, it just ran the update. Wait, the existing logic was: UPDATE stock SET quantity = quantity - ? ...

                await connection.query(
                    `UPDATE stock SET quantity = quantity - ? 
           WHERE product_id = ? AND warehouse_id = ? AND tenant_id = ?`,
                    [item.quantity, item.product_id, item.warehouse_id, tenant_id]
                );

                await connection.query(
                    `INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [tenant_id, item.product_id, item.warehouse_id, -item.quantity, 'delivery', id]
                );
            }

            // 4. Update delivery status
            await connection.query(
                'UPDATE deliveries SET status = ? WHERE delivery_id = ?',
                ['done', id]
            );

            await connection.commit();
            return NextResponse.json({ message: 'Delivery validated successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Failed to validate delivery:', error);
            return NextResponse.json({ error: 'Failed to validate delivery' }, { status: 500 });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Failed to process validation request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
