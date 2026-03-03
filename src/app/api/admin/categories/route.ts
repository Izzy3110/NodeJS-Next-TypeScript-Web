import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(request: Request) {
    let conn;
    try {
        const body = await request.json();
        const { name, description, additional_text, order_id, pic_url } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        conn = await pool.getConnection();
        
        // Manually calculate next ID
        const [row] = await conn.query("SELECT MAX(id) as maxId FROM itemcats");
        const nextId = (row && (row as any).maxId ? (row as any).maxId : 0) + 1;

        // Generate href from name (simple slug)
        const href = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

        await conn.query(
            "INSERT INTO itemcats (id, name, href, description, additional_text, order_id, pic_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nextId, name, href, description || '', additional_text || '', order_id || null, pic_url || '']
        );
        return NextResponse.json({ success: true, id: nextId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
