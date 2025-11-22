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

            const [deliveries] = await connection.query(
                'SELECT status FROM deliveries WHERE delivery_id = ? AND tenant_id = ?',
                [id, tenant_id]
            );

            if (deliveries.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
            }

            const currentStatus = deliveries[0].status;
            if (currentStatus !== 'draft' && currentStatus !== 'ready') {
                await connection.rollback();
                return NextResponse.json({ error: 'Cannot cancel delivery in current status' }, { status: 400 });
            }

            await connection.query(
                'UPDATE deliveries SET status = ? WHERE delivery_id = ?',
                ['cancelled', id]
            );

            await connection.commit();
            return NextResponse.json({ message: 'Delivery cancelled successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Failed to cancel delivery:', error);
            return NextResponse.json({ error: 'Failed to cancel delivery' }, { status: 500 });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Failed to process cancel request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
