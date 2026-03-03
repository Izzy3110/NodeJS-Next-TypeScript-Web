
import pool from '../src/db';

async function verifyTranslations() {
    let conn;
    try {
        conn = await pool.getConnection();
        const items = await conn.query("SELECT count(*) as count FROM items_translations");
        const cats = await conn.query("SELECT count(*) as count FROM itemcats_translations");
        const zutaten = await conn.query("SELECT count(*) as count FROM pizza_zutaten_translations");
        
        console.log(`items_translations count: ${items[0].count}`);
        console.log(`itemcats_translations count: ${cats[0].count}`);
        console.log(`pizza_zutaten_translations count: ${zutaten[0].count}`);
    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

verifyTranslations();
