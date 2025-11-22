import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const companyName = `${name}'s Company`; // Default company name

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create Tenant
      const [tenantResult] = await connection.query(
        'INSERT INTO tenants (name) VALUES (?)',
        [companyName]
      );
      const tenantId = tenantResult.insertId;

      // Create User
      const [userResult] = await connection.query(
        'INSERT INTO users (tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [tenantId, name, email, hashedPassword, 'manager']
      );
      const userId = userResult.insertId;

      await connection.commit();

      const token = await signJWT({ sub: userId, email, name, tenant_id: tenantId });

      const cookieStore = await cookies();
      cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ message: 'User created successfully', user: { id: userId, name, email, tenant_id: tenantId } }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
