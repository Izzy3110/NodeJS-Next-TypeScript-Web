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
        
        console.log("Clearing pc_clients table...");
        await conn.query("DELETE FROM pc_clients");
        await conn.query("ALTER TABLE pc_clients AUTO_INCREMENT = 1");
        console.log("pc_clients table cleared and auto-increment reset.");

    } catch (err) {
        console.error("Error clearing pc_clients:", err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        if (pool) await pool.end();
        process.exit(0);
    }
}

run();
