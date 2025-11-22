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

            const [receipts] = await connection.query(
                'SELECT status FROM receipts WHERE receipt_id = ? AND tenant_id = ?',
                [id, tenant_id]
            );

            if (receipts.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
            }

            const currentStatus = receipts[0].status;
            if (currentStatus !== 'draft' && currentStatus !== 'ready') {
                await connection.rollback();
                return NextResponse.json({ error: 'Cannot cancel receipt in current status' }, { status: 400 });
            }

            await connection.query(
                'UPDATE receipts SET status = ? WHERE receipt_id = ?',
                ['cancelled', id]
            );

            await connection.commit();
            return NextResponse.json({ message: 'Receipt cancelled successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Failed to cancel receipt:', error);
            return NextResponse.json({ error: 'Failed to cancel receipt' }, { status: 500 });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Failed to process cancel request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
