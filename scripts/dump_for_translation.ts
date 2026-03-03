
import pool from '../src/db';
import * as fs from 'fs';

async function dumpItems() {
    let conn;
    try {
        conn = await pool.getConnection();
        const items = await conn.query("SELECT id, name, description FROM items");
        const cats = await conn.query("SELECT id, name, description FROM itemcats");
        const zutaten = await conn.query("SELECT id, name FROM pizza_zutaten"); // Assuming table exists

        const data = {
            items: items.map((i: any) => ({ id: i.id, name: i.name, description: i.description })),
            cats: cats.map((c: any) => ({ id: c.id, name: c.name, description: c.description })),
            zutaten: zutaten.map((z: any) => ({ id: z.id, name: z.name }))
        };

        fs.writeFileSync('db_dump.json', JSON.stringify(data, null, 2));
        console.log("Dumped to db_dump.json");

    } catch (err) {
        console.error("Dump failed:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

dumpItems();
