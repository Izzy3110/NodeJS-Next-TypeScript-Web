import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(request: Request) {
    let conn;
    try {
        const body = await request.json();
        const {
            cartid, category_id, name, description, price_type, goods_item,
            price, price_s, price_m, price_l, price_xl,
            in_menu_1, in_menu_2, in_menu_3, zutaten, show_menu
        } = body;

        const val = (v: any) => (v === '' || v === undefined) ? null : v;

        conn = await pool.getConnection();
        
        // Manually calculate next ID
        const [row] = await conn.query("SELECT MAX(id) as maxId FROM items");
        const nextId = (row && (row as any).maxId ? (row as any).maxId : 0) + 1;

        await conn.query(
            `INSERT INTO items (
                id, cartid, category_id, name, description, price_type, goods_item,
                price, price_s, price_m, price_l, price_xl, 
                in_menu_1, in_menu_2, in_menu_3, zutaten, show_menu
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nextId, val(cartid), val(category_id), val(name), val(description), val(price_type), val(goods_item),
                val(price), val(price_s), val(price_m), val(price_l), val(price_xl),
                val(in_menu_1), val(in_menu_2), val(in_menu_3), val(zutaten), val(show_menu)
            ]
        );
        return NextResponse.json({ success: true, id: nextId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
