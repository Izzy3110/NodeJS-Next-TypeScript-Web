import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function listCartIds() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query("SELECT cartid FROM items WHERE cartid IS NOT NULL ORDER BY CAST(cartid AS UNSIGNED) ASC");
        
        console.log("Cart IDs from items table:");
        console.log("--------------------------");
        
        let maxId = 0;
        for (const row of rows) {
            console.log(row.cartid);
            const numericId = parseInt(row.cartid, 10);
            if (!isNaN(numericId) && numericId > maxId) {
                maxId = numericId;
            }
        }
        
        console.log("--------------------------");
        console.log(`Total: ${rows.length} entries`);
        console.log(`highest cart-id: ${maxId}`);
        console.log(`next available cart-id: ${maxId + 1}`);

    } catch (err) {
        console.error("Failed to list cartids:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

listCartIds();
