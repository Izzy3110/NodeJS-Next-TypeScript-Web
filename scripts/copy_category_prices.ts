import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function copyCategoryPrices(sourceCategoryId: string, destCategoryId: string) {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();

        // 1. Resolve source order_id
        const sourceCats = await conn.query("SELECT order_id, name FROM itemcats WHERE id = ?", [sourceCategoryId]);
        if (sourceCats.length === 0) {
            console.log(`Source category with ID ${sourceCategoryId} not found.`);
            return;
        }
        const sourceOrderId = sourceCats[0].order_id;
        const sourceCategoryName = sourceCats[0].name;

        // 2. Resolve destination order_id
        const destCats = await conn.query("SELECT order_id, name FROM itemcats WHERE id = ?", [destCategoryId]);
        if (destCats.length === 0) {
            console.log(`Destination category with ID ${destCategoryId} not found.`);
            return;
        }
        const destOrderId = destCats[0].order_id;
        const destCategoryName = destCats[0].name;

        console.log(`Copying price_m from [${sourceCategoryName} (ID: ${sourceCategoryId})] to [${destCategoryName} (ID: ${destCategoryId})] based on matching descriptions...`);

        // 3. Perform update based on description
        // Use a JOIN to update target price_m from source price_m where descriptions match
        const query = `
            UPDATE items AS target
            JOIN items AS source ON target.description = source.description
            SET target.price_m = source.price_m
            WHERE source.category_id = ? 
              AND target.category_id = ?
              AND source.description IS NOT NULL 
              AND source.description != ''
        `;

        const result = await conn.query(query, [sourceOrderId, destOrderId]);
        console.log(`Successfully updated ${result.affectedRows} items.`);

    } catch (err) {
        console.error("Failed to copy prices:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

// Get IDs from command line arguments or default to 3 and 16
const args = process.argv.slice(2);
const sourceId = args[0] || "3";
const destId = args[1] || "16";

copyCategoryPrices(sourceId, destId);
