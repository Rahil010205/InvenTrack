import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { email } = await request.json();

        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Don't reveal user existence
            return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save OTP to password_resets table
        // Assuming table schema: email VARCHAR, otp VARCHAR, expires_at DATETIME
        await pool.query(
            'INSERT INTO password_resets (email, otp_code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?',
            [email, otp_code, expiresAt]
        );

        // Mock sending email
        console.log(`[MOCK EMAIL] To: ${email}, OTP: ${otp_code}`);

        return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' });
    } catch (error) {
        console.error('Failed to process forgot password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
