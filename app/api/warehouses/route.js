import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTenantId } from '@/lib/tenant';

export async function GET(request) {
    try {
        const tenantId = await getTenantId(request);
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [rows] = await pool.query('SELECT * FROM warehouses WHERE tenant_id = ?', [tenantId]);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Failed to fetch warehouses:', error);
        return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
    }
}
