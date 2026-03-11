import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyOrder() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();

        console.log("Fetching ALL items for category 16 (internal OrderID 5) without explicit ORDER BY...");
        const items = await conn.query("SELECT id, cartid, name FROM items WHERE category_id = 5");
        
        console.table(items);

    } catch (err) {
        console.error("Failed to verify order:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

verifyOrder();
