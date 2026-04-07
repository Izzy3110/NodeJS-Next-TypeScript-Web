import { NextResponse } from 'next/server';
import pool, { mapItemRow } from '@/db';

export async function GET() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rawItems = await conn.query("SELECT * FROM items ORDER BY category_id");
        const categories = await conn.query("SELECT * FROM itemcats ORDER BY order_id");
        const zutatenRows = await conn.query(`
            SELECT z.*, p.price_per_good 
            FROM pizza_zutaten z 
            LEFT JOIN pizza_zutaten_preise p ON z.id = p.id
        `);
        
        const zutaten = zutatenRows.map((z: any) => ({
            id: z.id,
            name: z.name,
            good_price: z.price_per_good ? parseFloat(z.price_per_good.replace(',', '.')) : 0.00
        }));
        
        const items = rawItems.map((item: any) => mapItemRow(item));
        
        return NextResponse.json({ items, categories, zutaten });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
