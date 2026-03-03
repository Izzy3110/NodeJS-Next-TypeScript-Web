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
        const res = await conn.query("DELETE FROM print_queue");
        console.log(`Cleared print_queue. Deleted ${res.affectedRows} jobs.`);

    } catch (err) {
        console.error("Error clearing queue:", err);
    } finally {
        if (conn) conn.release();
        if (pool) await pool.end();
    }
}

run();
