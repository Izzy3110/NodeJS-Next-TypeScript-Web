import { NextResponse } from 'next/server';
import pool, { mapItemRow } from '@/db';

export async function GET() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rawItems = await conn.query("SELECT * FROM items ORDER BY category_id");
        const categories = await conn.query("SELECT * FROM itemcats ORDER BY order_id");
        const zutaten = await conn.query("SELECT * FROM pizza_zutaten");
        
        const items = rawItems.map((item: any) => mapItemRow(item));
        
        return NextResponse.json({ items, categories, zutaten });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
