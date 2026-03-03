import mariadb from 'mariadb';

async function run() {
    let pool;
    let conn;
    try {
        pool = mariadb.createPool({
            host: '127.0.0.1',
            user: 'dbuser',
            password: 'qwert',
            database: 'localdb',
            connectionLimit: 5
        });

        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM pc_clients");
        console.table(rows);

    } catch (err) {
        console.error("Error listing pc_clients:", err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        if (pool) await pool.end();
        process.exit(0);
    }
}

run();
