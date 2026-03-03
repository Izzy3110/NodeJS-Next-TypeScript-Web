
import pool from '../src/db';

async function setupTranslationsV2() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to database.");

        // 1. Drop old tables
        const dropQueries = [
            `DROP TABLE IF EXISTS items_translations`,
            `DROP TABLE IF EXISTS itemcats_translations`,
            `DROP TABLE IF EXISTS pizza_zutaten_translations`
        ];

        for (const query of dropQueries) {
            await conn.query(query);
            console.log(`Executed: ${query}`);
        }

        // 2. Create new tables
        const createQueries = [
            `CREATE TABLE items_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                field_type INT NOT NULL COMMENT '1=name, 2=description',
                language_code VARCHAR(5) NOT NULL,
                base_text TEXT,
                base_language_code VARCHAR(5) DEFAULT 'de',
                translation TEXT,
                UNIQUE KEY unique_item_trans (item_id, field_type, language_code)
            )`,
            `CREATE TABLE itemcats_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                field_type INT NOT NULL COMMENT '1=name, 2=description, 3=additional_text',
                language_code VARCHAR(5) NOT NULL,
                base_text TEXT,
                base_language_code VARCHAR(5) DEFAULT 'de',
                translation TEXT,
                UNIQUE KEY unique_cat_trans (category_id, field_type, language_code)
            )`,
            `CREATE TABLE pizza_zutaten_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                goods_id INT NOT NULL,
                field_type INT NOT NULL COMMENT '1=name',
                language_code VARCHAR(5) NOT NULL,
                base_text TEXT,
                base_language_code VARCHAR(5) DEFAULT 'de',
                translation TEXT,
                UNIQUE KEY unique_goods_trans (goods_id, field_type, language_code)
            )`
        ];

        for (const query of createQueries) {
            await conn.query(query);
            console.log("Created table.");
        }

        // 3. Seed Items
        const items = await conn.query("SELECT * FROM items");
        console.log(`Migrating ${items.length} items...`);
        for (const item of items) {
            // Name (Type 1)
            if (item.name) {
                await conn.query(
                    `INSERT INTO items_translations (item_id, field_type, language_code, base_text, base_language_code, translation) VALUES (?, 1, 'de', ?, 'de', ?)`,
                    [item.id, item.name, item.name]
                );
            }
            // Description (Type 2)
            if (item.description) {
                await conn.query(
                    `INSERT INTO items_translations (item_id, field_type, language_code, base_text, base_language_code, translation) VALUES (?, 2, 'de', ?, 'de', ?)`,
                    [item.id, item.description, item.description]
                );
            }
        }

        // 4. Seed Categories
        const categories = await conn.query("SELECT * FROM itemcats");
        console.log(`Migrating ${categories.length} categories...`);
        for (const cat of categories) {
             // Name (Type 1)
             if (cat.name) {
                await conn.query(
                    `INSERT INTO itemcats_translations (category_id, field_type, language_code, base_text, base_language_code, translation) VALUES (?, 1, 'de', ?, 'de', ?)`,
                    [cat.id, cat.name, cat.name]
                );
            }
            // Description (Type 2)
            if (cat.description) {
                await conn.query(
                    `INSERT INTO itemcats_translations (category_id, field_type, language_code, base_text, base_language_code, translation) VALUES (?, 2, 'de', ?, 'de', ?)`,
                    [cat.id, cat.description, cat.description]
                );
            }
             // Additional Text (Type 3)
             if (cat.additional_text) {
                await conn.query(
                    `INSERT INTO itemcats_translations (category_id, field_type, language_code, base_text, base_language_code, translation) VALUES (?, 3, 'de', ?, 'de', ?)`,
                    [cat.id, cat.additional_text, cat.additional_text]
                );
            }
        }

        // 5. Seed Zutaten
        try {
            const zutaten = await conn.query("SELECT * FROM pizza_zutaten");
            console.log(`Migrating ${zutaten.length} zutaten...`);
            for (const zuta of zutaten) {
                // Name (Type 1)
                if (zuta.name) {
                    await conn.query(
                        `INSERT INTO pizza_zutaten_translations (goods_id, field_type, language_code, base_text, base_language_code, translation) VALUES (?, 1, 'de', ?, 'de', ?)`,
                        [zuta.id, zuta.name, zuta.name]
                    );
                }
            }
        } catch (e: any) {
             console.warn("Could not migrate pizza_zutaten:", e.message);
        }

        console.log("Migration V2 complete.");

    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

setupTranslationsV2();
