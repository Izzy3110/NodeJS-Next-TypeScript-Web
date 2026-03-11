import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function check() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();
        const categories = await conn.query("SELECT id, order_id, name FROM itemcats ORDER BY id ASC");
        
        console.log("ID\tOrderID\tName");
        for (const cat of categories) {
            console.log(`${cat.id}\t${cat.order_id}\t${cat.name}`);
        }
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

check();
