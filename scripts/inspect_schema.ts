
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function inspect() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("DESCRIBE items");
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

inspect();
