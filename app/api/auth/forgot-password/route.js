import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
    try {
        const { email } = await request.json();

        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Don't reveal user existence
            return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' });
        }

        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save OTP to password_resets table
        await pool.query(
            'INSERT INTO password_resets (email, otp_code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?',
            [email, otp_code, expiresAt, otp_code, expiresAt]
        );

        // Send email
        try {
            await sendEmail({
                to: email,
                subject: 'StockMaster Password Reset OTP',
                text: `Your OTP for password reset is: ${otp_code}. It expires in 15 minutes.`,
                html: `<p>Your OTP for password reset is: <strong>${otp_code}</strong></p><p>It expires in 15 minutes.</p>`,
            });
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Optionally return an error or just log it. 
            // For security, we might still want to return success to the user.
        }

        return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' });
    } catch (error) {
        console.error('Failed to process forgot password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

