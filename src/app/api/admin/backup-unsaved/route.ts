import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/db';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function POST(request: Request) {
    let conn;
    try {
        const body = await request.json();
        const { modifiedItems, modifiedCategories } = body;

        conn = await pool.getConnection();
        let dbItems = await conn.query("SELECT * FROM items");
        let dbCats = await conn.query("SELECT * FROM itemcats");

        const val = (v: any) => (v === '' || v === undefined) ? null : v;

        if (modifiedItems && Array.isArray(modifiedItems)) {
            dbItems = dbItems.map((dbItem: any) => {
                const local = modifiedItems.find((m: any) => m.id === dbItem.id);
                if (local) {
                    const merged = { ...dbItem };
                    for (const [k, v] of Object.entries(local)) {
                        merged[k] = val(v);
                    }
                    return merged;
                }
                return dbItem;
            });
        }

        if (modifiedCategories && Array.isArray(modifiedCategories)) {
            dbCats = dbCats.map((dbCat: any) => {
                const local = modifiedCategories.find((m: any) => m.id === dbCat.id);
                if (local) {
                    const merged = { ...dbCat };
                    for (const [k, v] of Object.entries(local)) {
                        merged[k] = val(v);
                    }
                    return merged;
                }
                return dbCat;
            });
        }

        const backupData = {
            timestamp: new Date().toISOString(),
            description: 'Unsaved State Backup',
            items: dbItems,
            categories: dbCats
        };

        const prefix = (modifiedItems?.length === 0 && modifiedCategories?.length > 0) ? 'backup-categories-unsaved-' : 'backup-unsaved-';
        const filename = `${prefix}${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(BACKUP_DIR, filename);

        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
        return NextResponse.json({ success: true, filename });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unsaved backup failed' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
