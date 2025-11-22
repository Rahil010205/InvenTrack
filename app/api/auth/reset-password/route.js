import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, otp, newPassword } = await request.json();

        // Verify OTP
        const [resets] = await pool.query(
            'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()',
            [email, otp]
        );

        if (resets.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

        // Delete OTP
        await pool.query('DELETE FROM password_resets WHERE email = ?', [email]);

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Failed to reset password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
