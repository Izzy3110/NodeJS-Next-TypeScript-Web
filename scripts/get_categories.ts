import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Dynamic import will be used to ensure 'pool' is initialized AFTER dotenv.config
// import pool from '../src/db';

async function getCategories() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();
        const categories = await conn.query("SELECT id, name FROM itemcats ORDER BY id ASC");
        
        // Print table header
        console.log("ID\tCategory.Name");
        console.log("-------------------------------");
        
        // Print rows
        for (const cat of categories) {
            console.log(`${cat.id}\t${cat.name}`);
        }
        
    } catch (err) {
        console.error("Failed to query categories:", err);
    } finally {
        if (conn) conn.release();
        // End pool so the script exits cleanly
        await pool.end();
        process.exit(0);
    }
}

getCategories();
