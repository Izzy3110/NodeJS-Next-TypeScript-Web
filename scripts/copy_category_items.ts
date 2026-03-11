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

async function copyItemsWithoutPrices(sourceCategoryId: string, destCategoryId: string, columnsToCopy: string[]) {
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

        // 3. Fetch items using resolved source order_id
        console.log(`Fetching items from [${sourceCategoryName} (ID: ${sourceCategoryId}, internal OrderID: ${sourceOrderId})]...`);
        const items = await conn.query("SELECT * FROM items WHERE category_id = ? ORDER BY id ASC", [sourceOrderId]);
        
        if (items.length === 0) {
            console.log(`No items found in category ID ${sourceCategoryId}.`);
            return;
        }

        // 4. Get next available cartid
        const cartIdsResult = await conn.query("SELECT cartid FROM items WHERE cartid IS NOT NULL");
        let maxCartId = 0;
        for (const row of cartIdsResult) {
            const numericId = parseInt(row.cartid, 10);
            if (!isNaN(numericId) && numericId > maxCartId) {
                maxCartId = numericId;
            }
        }
        let nextCartId = maxCartId + 1;
        console.log(`Next available cart-id: ${nextCartId}`);

        // 5. Get next available DB id (AUTO_INCREMENT)
        const tableStatus = await conn.query("SHOW TABLE STATUS LIKE 'items'");
        let nextDbId = tableStatus[0].Auto_increment;
        console.log(`Estimated next database ID: ${nextDbId}`);

        // 6. Prepare items for insertion
        const preparedItems = items.map((item: any) => {
            const newItem = { ...item };
            newItem.id = nextDbId++; // This is just for preview purposes, the DB will actually assign it
            newItem.category_id = destOrderId;
            newItem.cartid = (nextCartId++).toString();
            
            // Nullify all price columns UNLESS specified in columnsToCopy
            Object.keys(newItem).forEach(key => {
                if (key.startsWith('price') && !columnsToCopy.includes(key)) {
                    newItem[key] = null;
                }
            });

            // Set default price_type to 2
            newItem.price_type = 2;
            
            return newItem;
        });

        console.log(`\nPreview: Prepared ${preparedItems.length} items for insertion into [${destCategoryName} (ID: ${destCategoryId}, internal OrderID: ${destOrderId})]:`);
        if (columnsToCopy.length > 0) {
            console.log(`Preserving columns: ${columnsToCopy.join(', ')}`);
        } else {
            console.log("Nullifying all prices.");
        }
        console.log("--------------------------------------------------");
        preparedItems.slice(0, 50).forEach((item: any, index: number) => {
            let priceInfo = "";
            if (columnsToCopy.length > 0) {
                priceInfo = " | " + columnsToCopy.map(col => `${col}: ${item[col]}`).join(', ');
            }
            console.log(`${index + 1}. [id: ${item.id}, cartid: ${item.cartid}] Name: ${item.name}${priceInfo}`);
        });
        if (preparedItems.length > 50) console.log("... (truncated)");
        console.log("--------------------------------------------------");

        const answer = await askQuestion(`Do you want to insert these ${preparedItems.length} items into the database? (y/n): `);
        
        if (answer.toLowerCase() === 'y') {
            const columns = Object.keys(preparedItems[0]).filter(k => k !== 'id'); // Exclude id from insert to let DB handle it
            const placeholders = columns.map(() => '?').join(', ');
            const query = `INSERT INTO items (${columns.join(', ')}) VALUES (${placeholders})`;
            
            console.log("Starting batch insertion...");
            for (const item of preparedItems) {
                const values = columns.map(col => item[col]);
                await conn.query(query, values);
            }
            console.log(`Successfully inserted ${preparedItems.length} items into category ${destCategoryId} (internal OrderID: ${destOrderId}).`);
        } else {
            console.log("Insertion cancelled by user.");
        }

    } catch (err) {
        console.error("Failed to copy items:", err);
    } finally {
        if (conn) conn.release();
        rl.close();
        await pool.end();
        process.exit(0);
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: npx tsx scripts/copy_category_items.ts <source_category_id> <dest_category_id> [--columns col1,col2]");
    process.exit(1);
}

const sourceId = args[0];
const destId = args[1];
let columnsToCopy: string[] = [];

const colIndex = args.indexOf('--columns');
if (colIndex !== -1 && args[colIndex + 1]) {
    columnsToCopy = args[colIndex + 1].split(',').map(c => c.trim());
}

copyItemsWithoutPrices(sourceId, destId, columnsToCopy);
