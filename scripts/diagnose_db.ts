import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function diagnose() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    try {
        conn = await pool.getConnection();

        const columnsData = await conn.query("SHOW COLUMNS FROM items");
        console.log(columnsData.map((c: any) => `${c.Field} (${c.Key})`).join(", "));
        
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

diagnose();
