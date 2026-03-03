import mariadb from 'mariadb';

async function run() {
    let pool;
    let conn;
    try {
        pool = mariadb.createPool({
            host: '127.0.0.1',
            user: 'dbuser', // Assuming cached credentials from previous context
            password: 'qwert',
            database: 'localdb',
            connectionLimit: 5
        });

        conn = await pool.getConnection();

        // 1. Clear table
        await conn.query("DELETE FROM pc_clients");
        console.log("Table cleared.");

        // 2. Insert IP
        await conn.query("INSERT INTO pc_clients (api_key_id, last_ip) VALUES (?, ?)", [2, '192.168.1.100']); // Assuming api_key_id 2 exists
        console.log("Inserted 192.168.1.100");

        // 3. Try Insert Same IP (Should fail if UNIQUE, or Update if logic is correct but testing raw insert first to check constraint)
        // Wait, the API uses ON DUPLICATE KEY UPDATE.
        // Let's test standard INSERT to see if it throws error (Constraint check)
        try {
             await conn.query("INSERT INTO pc_clients (api_key_id, last_ip) VALUES (?, ?)", [2, '192.168.1.100']);
             console.log("Duplicate INSERT succeeded (Constraint MISSING!)");
        } catch (e) {
             console.log("Duplicate INSERT failed (Constraint EXISTS):", e.message);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) conn.release();
        if (pool) await pool.end();
    }
}

run();
