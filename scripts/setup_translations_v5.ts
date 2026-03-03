
import pool from '../src/db';

async function setupTranslationsV5() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to database.");

        const queries = [
            "RENAME TABLE itemcats_translations TO translations_itemcats",
            "RENAME TABLE items_translations TO translations_items",
            "RENAME TABLE pizza_zutaten_translations TO translations_pizza_zutaten"
        ];

        for (const query of queries) {
            try {
                await conn.query(query);
                console.log(`Executed: ${query}`);
            } catch (e: any) {
                // Ignore if table already renamed or doesn't exist (idempotency check akin to IF EXISTS)
                console.warn(`Warning executing '${query}': ${e.message}`);
            }
        }

        console.log("Migration V5 (Rename Tables) complete.");

    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

setupTranslationsV5();
