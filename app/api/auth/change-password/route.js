import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { sub: userId } = payload;

        const { currentPassword, newPassword } = await request.json();

        // Get user
        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const user = users[0];

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, userId]);

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Failed to change password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
