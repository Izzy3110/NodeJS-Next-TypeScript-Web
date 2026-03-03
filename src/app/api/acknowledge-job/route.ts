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

        // Parse Body
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const { jobId } = body;
        if (!jobId) {
             return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
        }

        conn = await pool.getConnection();

        // 1. Validate API Key
        const rows: any = await conn.query("SELECT id FROM api_keys WHERE api_key = ?", [apiKey]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const apiKeyId = rows[0].id;

        // 2. Delete Job (Ensure it belongs to this API Key)
        const result: any = await conn.query(
            "DELETE FROM print_queue WHERE id = ? AND api_key_id = ?",
            [jobId, apiKeyId]
        );

        if (result.affectedRows > 0) {
            return NextResponse.json({ status: 'success', message: 'Job acknowledged and removed' });
        } else {
            // Either job didn't exist or didn't belong to this key
            return NextResponse.json({ status: 'ignored', message: 'Job not found or already removed' });
        }

    } catch (err) {
        console.error("Error acknowledging job:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
