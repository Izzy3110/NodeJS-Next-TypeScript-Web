
import pool from '../src/db';

async function setupTranslationsV6() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to database.");

        // 1. Create table
        const query = `CREATE TABLE IF NOT EXISTS translations_food_variants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            food_variant_id INT NOT NULL,
            field_type INT NOT NULL COMMENT '1=name',
            language_code VARCHAR(5) NOT NULL,
            base TEXT,
            base_language_code VARCHAR(5) DEFAULT 'de',
            value TEXT,
            base_ref_id INT DEFAULT NULL COMMENT 'Reference to the base translation ID',
            UNIQUE KEY unique_variant_trans (food_variant_id, field_type, language_code)
        )`;

        await conn.query(query);
        console.log("Created table translations_food_variants.");

        // 2. Seed Data from food_variants
        const variants = await conn.query("SELECT * FROM food_variants");
        console.log(`Migrating ${variants.length} food variants...`);
        
        for (const variant of variants) {
            // Name (Type 1)
            // Checking if 'name' exists on variant object (it should based on standard pattern, but verified earlier via schema check would be better)
            // Assuming 'name' column exists based on context.
             if (variant.name) {
                await conn.query(
                    `INSERT IGNORE INTO translations_food_variants (food_variant_id, field_type, language_code, base, base_language_code, value) VALUES (?, 1, 'de', ?, 'de', ?)`,
                    [variant.id, variant.name, variant.name]
                );
            }
        }
        console.log("Seeded translations_food_variants.");

        console.log("Migration V6 complete.");

    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

setupTranslationsV6();
