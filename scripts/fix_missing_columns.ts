
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function fixSchema() {
    let conn;
    try {
        console.log("Checking for missing columns...");
        conn = await pool.getConnection();

        const addColumn = async (colName: string, def: string) => {
             try {
                await conn.query(`ALTER TABLE items ADD COLUMN ${colName} ${def}`);
                console.log(`Added column ${colName}.`);
            } catch (e: any) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                     console.log(`Column ${colName} already exists.`);
                } else {
                    throw e;
                }
            }
        };

        await addColumn('goods_item', 'INT(1) DEFAULT 0');
        await addColumn('show_menu', 'INT(1) DEFAULT 0');

        console.log("Schema fix completed.");

    } catch (err) {
        console.error("Schema fix failed:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

fixSchema();
