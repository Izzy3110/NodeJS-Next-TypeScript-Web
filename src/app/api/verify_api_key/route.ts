import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request: Request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ valid: false, error: 'Missing Authorization header' }, { status: 400 });
    }

    // Support "Bearer <token>" or just "<token>"
    let apiKey = authHeader;
    if (authHeader.startsWith("Bearer ")) {
        apiKey = authHeader.split(" ")[1];
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT 1 FROM api_keys WHERE api_key = ?',
            [apiKey]
        );

        if (rows.length > 0) {
            return NextResponse.json({ valid: true });
        } else {
            return NextResponse.json({ valid: false });
        }
    } catch (err) {
        console.error("Error verifying API key:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
