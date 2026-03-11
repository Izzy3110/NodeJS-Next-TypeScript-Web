import pool from './src/db.js';

async function check() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("DESCRIBE orders");
        console.log(rows);
    } catch(err) {
        console.error(err);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}
check();
