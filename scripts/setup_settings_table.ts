import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function setupSettings() {
    let conn;
    try {
        console.log("Connecting to MariaDB...");
        conn = await pool.getConnection();

        console.log("Creating 'settings' table if it doesn't exist...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS settings (
                s_key VARCHAR(255) PRIMARY KEY,
                s_val TEXT
            )
        `);

        // Seed initial values
        console.log("Seeding default settings...");
        const defaults = [
            ['tax_percentage', '7'],
            ['delivery_costs', '2.50']
        ];

        for (const [key, val] of defaults) {
            await conn.query(
                "INSERT IGNORE INTO settings (s_key, s_val) VALUES (?, ?)",
                [key, val]
            );
        }

        console.log("Settings table setup complete.");
    } catch (err) {
        console.error("Setup failed:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

setupSettings();
