
import pool from '../src/db';

async function setupTranslations() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to database.");

        // 1. Create tables
        const queries = [
            `CREATE TABLE IF NOT EXISTS items_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                language_code VARCHAR(5) NOT NULL,
                name VARCHAR(255),
                description TEXT,
                UNIQUE KEY unique_translation (item_id, language_code)
            )`,
            `CREATE TABLE IF NOT EXISTS itemcats_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                language_code VARCHAR(5) NOT NULL,
                name VARCHAR(255),
                description TEXT,
                UNIQUE KEY unique_cat_translation (category_id, language_code)
            )`,
            `CREATE TABLE IF NOT EXISTS pizza_zutaten_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                zutaten_id INT NOT NULL,
                language_code VARCHAR(5) NOT NULL,
                name VARCHAR(255),
                UNIQUE KEY unique_zutaten_translation (zutaten_id, language_code)
            )`
        ];

        for (const query of queries) {
            await conn.query(query);
            console.log("Executed schema query.");
        }

        // 2. Seed items
        const items = await conn.query("SELECT * FROM items");
        console.log(`Found ${items.length} items to migrate.`);
        for (const item of items) {
            // German (DE) - Original
            await conn.query(
                `INSERT IGNORE INTO items_translations (item_id, language_code, name, description) VALUES (?, 'de', ?, ?)`,
                [item.id, item.name, item.description]
            );
            // English (EN) - Placeholder (Copy of DE for now)
            await conn.query(
                `INSERT IGNORE INTO items_translations (item_id, language_code, name, description) VALUES (?, 'en', ?, ?)`,
                [item.id, `${item.name} [EN]`, item.description ? `${item.description} [EN]` : null]
            );
        }

        // 3. Seed categories
        const categories = await conn.query("SELECT * FROM itemcats");
        console.log(`Found ${categories.length} categories to migrate.`);
        for (const cat of categories) {
             // German (DE)
             await conn.query(
                `INSERT IGNORE INTO itemcats_translations (category_id, language_code, name, description) VALUES (?, 'de', ?, ?)`,
                [cat.id, cat.name, cat.description]
            );
            // English (EN)
            await conn.query(
                `INSERT IGNORE INTO itemcats_translations (category_id, language_code, name, description) VALUES (?, 'en', ?, ?)`,
                [cat.id, `${cat.name} [EN]`, cat.description ? `${cat.description} [EN]` : null]
            );
        }

        // 4. Seed zutaten (check existence first? assume exists due to user request)
        // Note: User said "pizza_zutaten". Assuming table exists.
        try {
            const zutaten = await conn.query("SELECT * FROM pizza_zutaten");
            console.log(`Found ${zutaten.length} zutaten to migrate.`);
            for (const zuta of zutaten) {
                 // German (DE)
                 await conn.query(
                    `INSERT IGNORE INTO pizza_zutaten_translations (zutaten_id, language_code, name) VALUES (?, 'de', ?)`,
                    [zuta.id, zuta.name]
                );
                // English (EN)
                await conn.query(
                    `INSERT IGNORE INTO pizza_zutaten_translations (zutaten_id, language_code, name) VALUES (?, 'en', ?)`,
                    [zuta.id, `${zuta.name} [EN]`]
                );
            }
        } catch (e: any) {
            console.warn("Could not migrate pizza_zutaten (maybe table missing?):", e.message);
        }

        console.log("Translation setup complete.");

    } catch (err) {
        console.error("Error setting up translations:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

setupTranslations();
