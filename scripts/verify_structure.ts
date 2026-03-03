
import pool from '../src/db';

async function verify() {
    let conn;
    try {
        conn = await pool.getConnection();
        const tables = ['translations_items', 'translations_itemcats', 'translations_pizza_zutaten', 'translation_languages', 'translations_food_variants'];
        
        for (const table of tables) {
            console.log(`\n--- Structure of ${table} ---`);
            const rows = await conn.query(`DESCRIBE ${table}`);
            console.table(rows);
            
            // Check for new columns
            const columns = rows.map((r: any) => r.Field);
            const hasBase = columns.includes('base');
            const hasValue = columns.includes('value');
            const hasBaseRefId = columns.includes('base_ref_id');
            const missingBaseText = !columns.includes('base_text');
            const missingTranslation = !columns.includes('translation');

            console.log(`Has 'base': ${hasBase}`);
            console.log(`Has 'value': ${hasValue}`);
            console.log(`Has 'base_ref_id': ${hasBaseRefId}`);
            console.log(`Removed 'base_text': ${missingBaseText}`);
            console.log(`Removed 'translation': ${missingTranslation}`);

            const count = await conn.query(`SELECT COUNT(*) as c FROM ${table}`);
            console.log(`Row count: ${count[0].c}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

verify();
