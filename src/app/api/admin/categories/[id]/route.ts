import { NextResponse } from 'next/server';
import pool from '@/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let conn;
    try {
        const body = await request.json();
        const { name, description, additional_text, order_id, pic_url } = body;

        conn = await pool.getConnection();
        await conn.query(
            "UPDATE itemcats SET name=?, description=?, additional_text=?, order_id=?, pic_url=? WHERE id=?",
            [name, description, additional_text, order_id, pic_url, id]
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM itemcats WHERE id=?", [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
