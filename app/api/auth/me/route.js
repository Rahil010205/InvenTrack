import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { sub: userId } = payload;

        const [users] = await pool.query('SELECT user_id, name, email, role, tenant_id FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ user: users[0] });
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
