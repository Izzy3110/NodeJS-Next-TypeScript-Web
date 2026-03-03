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

        // 1. Drop existing table
        await conn.query("DROP TABLE IF EXISTS pc_clients");
        console.log("Dropped pc_clients table.");

        // 2. Re-create with correct schema
        const createTable = `
            CREATE TABLE pc_clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                api_key_id INT NOT NULL,
                last_ip VARCHAR(45) NOT NULL,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE(last_ip),
                FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
            )
        `;
        await conn.query(createTable);
        console.log("Re-created pc_clients table with UNIQUE constraint.");

    } catch (err) {
        console.error("Error recreating table:", err);
    } finally {
        if (conn) conn.release();
        if (pool) await pool.end();
    }
}

run();
