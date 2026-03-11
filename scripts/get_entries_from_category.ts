import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function getEntriesFromCategory(categoryId: string, isCsvMode: boolean) {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();

        // Query to get table columns to find 'price' columns
        const columns = await conn.query("SHOW COLUMNS FROM items");
        const priceColumns = columns
            .filter((col: any) => col.Field.startsWith('price'))
            .map((col: any) => col.Field);

        const selectCols = ['id', 'name', 'description', ...priceColumns].join(', ');
        
        let query = `SELECT ${selectCols} FROM items`;
        let params: any[] = [];

        if (categoryId) {
            // First, get the correct order_id for this category id
            const cats = await conn.query("SELECT order_id, name FROM itemcats WHERE id = ?", [categoryId]);
            if (cats.length === 0) {
                console.log(`Category with ID ${categoryId} not found.`);
                return;
            }
            const orderId = cats[0].order_id;
            const categoryName = cats[0].name;
            console.log(`Fetching items for category: ${categoryName} (ID: ${categoryId}, internal OrderID: ${orderId})`);
            
            query += ` WHERE category_id = ?`;
            params.push(orderId);
        }
        
        query += ` ORDER BY id ASC`;

        const items = await conn.query(query, params);
        
        // Output storage
        const outputLines: string[] = [];

        // Print table or CSV header
        const headers = ['id', 'name', 'description', ...priceColumns];
        if (isCsvMode) {
            outputLines.push(headers.map(h => `"${h}"`).join(','));
        } else {
            outputLines.push(headers.join('\t'));
            outputLines.push("-".repeat(80));
        }

        if (items.length === 0) {
            if (!isCsvMode) {
                console.log(`No items found${categoryId ? ` for category ID ${categoryId}` : ''}.`);
                return;
            }
            // In CSV mode, we continue to generate the file with just the header
        }

        // Print rows
        for (const item of items) {
            const row = headers.map(h => {
                let val = item[h];
                if (val === null || val === undefined) return isCsvMode ? '' : 'NULL';
                
                if (isCsvMode) {
                    // Escape double quotes by doubling them for valid CSV
                    const stringVal = String(val).replace(/"/g, '""');
                    // Enclose every field in double quotes for phpMyAdmin compatibility
                    return `"${stringVal}"`;
                } else {
                    // Trim long descriptions for tabular viewing
                    if (h === 'description' && String(val).length > 30) {
                        return String(val).substring(0, 27) + '...';
                    }
                    return val;
                }
            });
            outputLines.push(row.join(isCsvMode ? ',' : '\t'));
        }
        
        if (isCsvMode) {
            // Generate filename: pizza-<categoryId>-<timestamp>.csv
            const now = new Date();
            const dateStr = now.toISOString().replace(/[:.]/g, '-');
            const filename = `pizza-${categoryId}-${dateStr}.csv`;
            
            fs.writeFileSync(filename, outputLines.join('\n') + '\n', 'utf8');
            console.log(`Successfully exported ${items.length} items to ${filename}`);
        } else {
            console.log(outputLines.join('\n'));
        }
        
    } catch (err) {
        console.error("Failed to query items:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
let isCsvMode = false;
let categoryId = '';

for (const arg of args) {
    if (arg === '--csv') {
        isCsvMode = true;
    } else {
        categoryId = arg;
    }
}

getEntriesFromCategory(categoryId, isCsvMode);
