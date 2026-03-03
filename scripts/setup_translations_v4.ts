
import pool from '../src/db';

async function setupTranslationsV4() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to database.");

        // 1. Create table
        const query = `CREATE TABLE IF NOT EXISTS translation_languages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            languages VARCHAR(5) NOT NULL,
            base_language VARCHAR(5) NOT NULL,
            UNIQUE KEY unique_lang (languages)
        )`;

        await conn.query(query);
        console.log("Created table translation_languages.");

        // 2. Seed Data
        const seedQueries = [
            `INSERT IGNORE INTO translation_languages (languages, base_language) VALUES ('de', 'de')`,
            `INSERT IGNORE INTO translation_languages (languages, base_language) VALUES ('en', 'de')`
        ];

        for (const q of seedQueries) {
            await conn.query(q);
        }
        console.log("Seeded translation_languages.");

        console.log("Migration V4 complete.");

    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        if (conn) conn.release();
        pool.end();
    }
}

setupTranslationsV4();
