import pool from '../src/db';

async function migrate() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Checking for 'show_menu' column in 'items' table...");
        
        const columns = await conn.query("SHOW COLUMNS FROM items LIKE 'show_menu'");
        
        if (columns.length === 0) {
            console.log("Adding 'show_menu' column...");
            await conn.query("ALTER TABLE items ADD COLUMN show_menu INT DEFAULT 0");
            console.log("Column 'show_menu' added successfully.");
        } else {
            console.log("Column 'show_menu' already exists.");
        }
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

migrate();
function val(arg0: any): any {
    throw new Error('Function not implemented.');
}

