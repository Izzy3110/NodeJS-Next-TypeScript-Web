
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function cleanup() {
    let conn;
    try {
        console.log("Cleaning up test pizzas...");
        conn = await pool.getConnection();
        
        const names = ["Test Pizza 123", "Final Test Pizza"];
        
        for (const name of names) {
            const res = await conn.query("DELETE FROM items WHERE name = ?", [name]);
            console.log(`Deleted '${name}':`, res.affectedRows, "rows affected.");
        }

    } catch (err: any) {
        console.error("Cleanup failed:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

cleanup();
