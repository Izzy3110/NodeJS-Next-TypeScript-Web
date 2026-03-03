import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(request: Request) {
    let conn;
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        let apiKey = authHeader;
        if (apiKey.startsWith('Bearer ')) {
            apiKey = apiKey.substring(7);
        }

        conn = await pool.getConnection();

        // 1. Validate API Key
        const rows: any = await conn.query("SELECT id FROM api_keys WHERE api_key = ?", [apiKey]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKeyId = rows[0].id;

        // 2. Process incoming JSON
        let body;
        try {
            body = await request.json();
        } catch (e) {
            // If body is not valid JSON, we might still want to log the IP, but user said "process incoming json"
            console.error("Invalid JSON body", e);
            // return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // 3. Get client IP
        // Next.js request headers or socket address
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || "127.0.0.1";
        
        // 4. Upsert into pc_clients
        // Using ON DUPLICATE KEY UPDATE is cleaner and handles concurrency better
        // We pass new Date() which the driver converts to a format MariaDB TIMESTAMP accepts
        await conn.query(`
            INSERT INTO pc_clients (api_key_id, last_ip, last_seen) 
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                last_seen = NOW(),
                api_key_id = VALUES(api_key_id)
        `, [apiKeyId, ip]);

        return NextResponse.json({ status: 'success', message: 'IP input processed' });
    } catch (err) {
        console.error("Error in ip-input endpoint:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
