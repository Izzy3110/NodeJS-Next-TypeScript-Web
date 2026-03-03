import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function setup() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to database.");

        // Create api_keys table
        console.log("Creating api_keys table...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                created INT NOT NULL,
                api_key VARCHAR(255) NOT NULL UNIQUE
            )
        `);

        // Create pc_clients table
        console.log("Creating pc_clients table...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS pc_clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                last_ip VARCHAR(45),
                last_seen INT NOT NULL,
                api_key_id INT,
                FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
            )
        `);

        console.log("Database setup completed successfully.");
    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

setup();
