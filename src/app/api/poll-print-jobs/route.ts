import { NextResponse } from 'next/server';
import pool from '@/db';

export async function GET(request: Request) {
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

        // 2. Fetch Oldest Pending Job
        // We check if table exists first to avoid error on first poll if no jobs ever queued
        // or just rely on the fact that if it doesn't exist, it throws, which we catch.
        // Better: ensure table exists if we want robustness, but queue-job creates it.
        // Let's wrap query in try-catch specifically for "Table doesn't exist"
        
        try {
            const jobs: any = await conn.query(
                "SELECT id, content, filename, created_at FROM print_queue WHERE api_key_id = ? ORDER BY created_at ASC LIMIT 1",
                [apiKeyId]
            );

            if (jobs.length > 0) {
                return NextResponse.json({ job: jobs[0] });
            } else {
                return NextResponse.json({ job: null });
            }
        } catch (dbErr: any) {
            if (dbErr.code === 'ER_NO_SUCH_TABLE') {
                 return NextResponse.json({ job: null });
            }
            throw dbErr;
        }

    } catch (err) {
        console.error("Error polling jobs:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
