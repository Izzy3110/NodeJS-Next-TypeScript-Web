import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(request: Request) {
    let conn;
    try {
        const formData = await request.formData();
        const file = formData.get('backupFile') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileContent = await file.text();
        const backupData = JSON.parse(fileContent);

        if (!backupData.categories || !Array.isArray(backupData.categories)) {
            return NextResponse.json({ error: 'Invalid backup file: missing categories array' }, { status: 400 });
        }

        conn = await pool.getConnection();
        await conn.query("START TRANSACTION");
        await conn.query("DELETE FROM itemcats");

        const insertQuery = "INSERT INTO itemcats (id, order_id, name, href, description, additional_text, pic_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
        for (const cat of backupData.categories) {
            await conn.query(insertQuery, [
                cat.id,
                cat.order_id,
                cat.name || '',
                cat.href || '',
                cat.description || '',
                cat.additional_text || '',
                cat.pic_url || ''
            ]);
        }

        await conn.query("COMMIT");
        return NextResponse.json({ success: true });
    } catch (err) {
        if (conn) await conn.query("ROLLBACK");
        console.error(err);
        return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
