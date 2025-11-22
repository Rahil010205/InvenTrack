import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM warehouses ORDER BY name');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}
