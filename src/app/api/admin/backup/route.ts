import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/db';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function POST() {
    let conn;
    try {
        conn = await pool.getConnection();
        const items = await conn.query("SELECT * FROM items");
        const categories = await conn.query("SELECT * FROM itemcats");

        const backupData = {
            timestamp: new Date().toISOString(),
            items,
            categories
        };

        const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(BACKUP_DIR, filename);

        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
        return NextResponse.json({ success: true, filename });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
