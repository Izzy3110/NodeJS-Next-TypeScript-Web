const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

async function initDb() {
    console.log("Checking if database initialization is needed...");
    
    // Check if host configuration is available
    if (!process.env.DB_HOST && !process.env.MARIADB_HOST) {
        console.log("Warning: No DB_HOST provided. Falling back to localhost.");
    }

    const pool = mariadb.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'dbuser',
        password: process.env.DB_PASSWORD || 'qwert',
        database: process.env.DB_NAME || 'localdb',
        connectionLimit: 1,
        multipleStatements: true // Required to run full dump file
    });

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SHOW TABLES LIKE 'items'");
        
        if (rows.length === 0) {
            console.log("Table 'items' does not exist. Installing database from dump...");
            const sqlPath = path.join(__dirname, '..', 'dbdata', 'localdb__2026-02-22_22-12-30.sql');
            
            if (fs.existsSync(sqlPath)) {
                let sql = fs.readFileSync(sqlPath, 'utf8');
                
                // Strip out specific "USE database" commands which break when the user
                // mounts a database with a different name (like pizzapfd_db1)
                sql = sql.replace(/^USE\s+`?[^`]+`?\s*;/gm, '');

                console.log("Executing SQL dump... This might take a moment.");
                await conn.query(sql);
                console.log("Database initialized successfully!");
            } else {
                console.error("CRITICAL ERROR: SQL dump file not found at", sqlPath);
            }
        } else {
            console.log("Database 'items' table already exists. Skipping initialization.");
        }
    } catch (err) {
        console.error("Error during database initialization:", err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

initDb();
