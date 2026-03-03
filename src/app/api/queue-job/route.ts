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

        // 1. Validate Target API Key
        const rows: any = await conn.query("SELECT id FROM api_keys WHERE api_key = ?", [apiKey]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const apiKeyId = rows[0].id;

        // 2. Parse Body
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { content, filename } = body;
        if (!content || !filename) {
            return NextResponse.json({ error: 'Missing content (base64) or filename' }, { status: 400 });
        }

        // 3. Ensure Table Exists
        await conn.query(`
            CREATE TABLE IF NOT EXISTS print_queue (
                id INT AUTO_INCREMENT PRIMARY KEY,
                api_key_id INT,
                content LONGTEXT,
                filename VARCHAR(255),
                created_at INT,
                FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
            )
        `);

        // 4. Insert Job
        const unixTimeStamp = Math.floor(Date.now() / 1000);
        await conn.query(
            "INSERT INTO print_queue (api_key_id, content, filename, created_at) VALUES (?, ?, ?, ?)",
            [apiKeyId, content, filename, unixTimeStamp]
        );

        return NextResponse.json({ status: 'success', message: 'Job queued' });

    } catch (err) {
        console.error("Error queueing job:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
