import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function deleteCategoryItems(categoryId: string, minId?: number) {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();

        // 1. Use categoryId directly as the internal OrderID (category_id in items table)
        const orderId = categoryId;

        // 2. Fetch items to be deleted
        let query = "SELECT id, name, cartid FROM items WHERE category_id = ?";
        const params: any[] = [orderId];
        
        if (minId !== undefined) {
            query += " AND id >= ?";
            params.push(minId);
        }
        
        query += " ORDER BY id DESC";

        const items = await conn.query(query, params);
        
        if (items.length === 0) {
            console.log(`No items found for internal category_id [${orderId}]${minId !== undefined ? ` with ID >= ${minId}` : ''}.`);
            return;
        }

        console.log(`\nPreview: Items to be DELETED for internal category_id [${orderId}]:`);
        console.log("--------------------------------------------------");
        items.slice(0, 50).forEach((item: any) => {
            console.log(`Delete ID: ${item.id} | cartid: ${item.cartid} | Name: ${item.name}`);
        });
        if (items.length > 50) console.log("... (truncated)");
        console.log("--------------------------------------------------");

        const answer = await askQuestion(`CRITICAL: Do you want to DELETE ${items.length} items from the database? (y/n): `);
        
        if (answer.toLowerCase() === 'y') {
            const deleteQuery = minId !== undefined 
                ? "DELETE FROM items WHERE category_id = ? AND id >= ?"
                : "DELETE FROM items WHERE category_id = ?";
            
            const result = await conn.query(deleteQuery, params);
            console.log(`Successfully deleted ${result.affectedRows} items.`);
        } else {
            console.log("Deletion cancelled by user.");
        }

    } catch (err) {
        console.error("Failed to delete items:", err);
    } finally {
        if (conn) conn.release();
        rl.close();
        await pool.end();
        process.exit(0);
    }
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: npx tsx scripts/delete_category_items.ts <category_id> [--min-id <id>]");
    process.exit(1);
}

const categoryId = args[0];
let minId: number | undefined;

const minIdIndex = args.indexOf('--min-id');
if (minIdIndex !== -1 && args[minIdIndex + 1]) {
    minId = parseInt(args[minIdIndex + 1], 10);
}

deleteCategoryItems(categoryId, minId);
