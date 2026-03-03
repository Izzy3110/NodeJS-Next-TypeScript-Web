import { NextResponse } from 'next/server';
import pool from '@/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
        await conn.query(
            `UPDATE items SET 
                cartid=?, category_id=?, name=?, description=?, price_type=?, goods_item=?,
                price=?, price_s=?, price_m=?, price_l=?, price_xl=?, 
                in_menu_1=?, in_menu_2=?, in_menu_3=?, zutaten=?, show_menu=? 
             WHERE id=?`,
            [
                val(cartid), val(category_id), val(name), val(description), val(price_type), val(goods_item),
                val(price), val(price_s), val(price_m), val(price_l), val(price_xl),
                val(in_menu_1), val(in_menu_2), val(in_menu_3), val(zutaten), val(show_menu),
                id
            ]
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
        await conn.query("DELETE FROM items WHERE id=?", [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
