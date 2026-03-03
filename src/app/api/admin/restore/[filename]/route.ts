import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/db';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function POST(request: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;
    
    // Basic safety check for filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    let conn;

    if (!fs.existsSync(filepath)) {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }

    try {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Only delete items if backup contains items
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            await conn.query("DELETE FROM items");
            const clean = (val: any, def: any = null) => (val === '' || val === undefined || val === null) ? def : val;
            for (const item of data.items) {
                await conn.query(
                    "INSERT INTO items (id, cartid, category_id, name, description, price_type, goods_item, price, price_s, price_m, price_l, price_xl, in_menu_1, in_menu_2, in_menu_3, zutaten) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        item.id, clean(item.cartid, ''), clean(item.category_id, null), clean(item.name, ''),
                        clean(item.description, null), clean(item.price_type, null), clean(item.goods_item, 1), clean(item.price, null),
                        clean(item.price_s, null), clean(item.price_m, null), clean(item.price_l, null), clean(item.price_xl, null), 
                        clean(item.in_menu_1, 0), clean(item.in_menu_2, null),
                        clean(item.in_menu_3, null), clean(item.zutaten, null)
                    ]
                );
            }
        }

        // Only delete categories if backup contains categories
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            await conn.query("DELETE FROM itemcats");
            for (const cat of data.categories) {
                await conn.query(
                    "INSERT INTO itemcats (id, order_id, name, href, description, additional_text, pic_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [cat.id, cat.order_id, cat.name, cat.href, cat.description, cat.additional_text, cat.pic_url]
                );
            }
        }

        await conn.commit();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (conn) await conn.rollback();
        console.error("Restore Error:", err);
        return NextResponse.json({ error: 'Restore failed', details: err.message }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
