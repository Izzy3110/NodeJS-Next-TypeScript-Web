
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function migrate() {
    let conn;
    try {
        console.log("Starting migration: Pizza Sizes (M, L, XL, XXL -> S, M, L, XL)...");
        conn = await pool.getConnection();
        
        // 1. Add or Modify price_s column to be VARCHAR(5)
        console.log("Ensuring 'price_s' column is VARCHAR(5)...");
        try {
            // Try to add it
            await conn.query("ALTER TABLE items ADD COLUMN price_s VARCHAR(5) DEFAULT NULL AFTER price_type");
            console.log("Added price_s.");
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                 console.log("Column 'price_s' already exists. Modifying to VARCHAR(5) to be sure...");
                 await conn.query("ALTER TABLE items MODIFY COLUMN price_s VARCHAR(5) DEFAULT NULL");
            } else {
                throw e;
            }
        }

        // 2. Shift values
        console.log("Shifting values...");
        // Since we are moving strings to strings, this should be safe.
        // But we must be careful if we run this multiple times!
        // If we run it twice, we shift S->S, M->S... wait.
        // S = M
        // M = L
        // L = XL
        // XL = XXL
        // XXL -> remains (but will be dropped)
        
        // If I run this twice:
        // Run 1: S gets old M. M gets old L.
        // Run 2: S gets NEW M (which is old L). 
        // So this operation is NOT idempotent if we just run UPDATE.
        // We need to check if we should run the update.
        // One check: Is `price_xxl` still there? If yes, we assume we haven't finished migration.
        // But if we failed *after* update but *before* drop, we might double-shift if we are not careful.
        
        // However, if we didn't commit transaction? MariaDB DDL (ALTER TABLE) auto-commits.
        // UPDATE is DML.
        // The previous script failed at UPDATE. So nothing was updated?
        // Wait, UPDATE transaction might have been rolled back if it failed?
        // Scripts didn't use explicit transaction.
        // Single UPDATE statement is atomic. It failed, so no rows changed.
        // So we are safe to run UPDATE again.
        
        await conn.query(`
            UPDATE items 
            SET 
                price_s = price_m,
                price_m = price_l,
                price_l = price_xl,
                price_xl = price_xxl
        `);
        console.log("Update successful.");
        
        // 3. Drop price_xxl column
        console.log("Dropping 'price_xxl' column...");
        try {
             await conn.query("ALTER TABLE items DROP COLUMN price_xxl");
        } catch (e: any) {
             if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log("Column 'price_xxl' does not exist, skipping drop.");
             } else {
                 throw e;
             }
        }

        console.log("Migration completed successfully.");

    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

migrate();
