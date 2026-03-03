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
        console.log("Connecting to MariaDB...");
        conn = await pool.getConnection();

        console.log("Creating 'version' table...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS version (
                id INT AUTO_INCREMENT PRIMARY KEY,
                version VARCHAR(50) NOT NULL,
                datetime DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            )
        `);

        console.log("Initializing version to 0.1.0...");
        // Check if version 0.1.0 already exists to avoid duplicates if run multiple times
        const rows = await conn.query("SELECT * FROM version WHERE version = ?", ['0.1.0']);
        if (rows.length === 0) {
            await conn.query("INSERT INTO version (version) VALUES (?)", ['0.1.0']);
            console.log("Version 0.1.0 inserted.");
        } else {
            console.log("Version 0.1.0 already exists.");
        }

        const current = await conn.query("SELECT * FROM version");
        console.table(current);

    } catch (err) {
        console.error("Error setting up version table:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

setup();
