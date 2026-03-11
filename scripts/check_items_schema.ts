import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkSchema() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();
        const r = await conn.query("SHOW FULL COLUMNS FROM items");
        console.log(JSON.stringify(r, null, 2));
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

checkSchema();
