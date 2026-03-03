import pool from '../src/db';

async function updateCategoryPriceType() {
    const categoryIdRaw = process.argv[2];
    const priceTypeValueRaw = process.argv[3];

    if (!categoryIdRaw || !priceTypeValueRaw) {
        console.error("Usage: npm run update-category-pricetype <CategoryId> <Value>");
        console.error("Example: npm run update-category-pricetype 2 1");
        process.exit(1);
    }

    const categoryId = Number(categoryIdRaw);
    const priceTypeValue = Number(priceTypeValueRaw);

    if (isNaN(categoryId) || isNaN(priceTypeValue)) {
        console.error("Error: CategoryId and Value must be numbers.");
        process.exit(1);
    }

    if (priceTypeValue !== 1 && priceTypeValue !== 2) {
        console.log(`Warning: Setting price_type to ${priceTypeValue}. Expected 1 or 2 usually.`);
    }

    console.log(`Updating all items in category ${categoryId} to price_type ${priceTypeValue}...`);

    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(
            "UPDATE items SET price_type = ? WHERE category_id = ?",
            [priceTypeValue, categoryId]
        );
        console.log(`Success! Updated ${res.affectedRows} items.`);
    } catch (err) {
        console.error("Update failed:", err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

updateCategoryPriceType();
