
import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});

async function testInsert() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Simulating the data sent by MenuEditor
        const newItem = {
            name: 'Test Pizza 123',
            description: 'S, M, L, XL test description',
            category_id: 4, // Pizza Klein
            price_type: 2,
            price: 0,
            price_s: 10,
            price_m: 11,
            price_l: 12,
            price_xl: 13,
            goods_item: 1,
            cartid: '999',
            show_menu: 0,
            in_menu_1: 0,
            in_menu_2: 0,
            in_menu_3: 0,
            zutaten: ''
        };

        const val = (v: any) => (v === '' || v === undefined) ? null : v;
        
        const [row] = await conn.query("SELECT MAX(id) as maxId FROM items");
        const nextId = (row && (row as any).maxId ? (row as any).maxId : 0) + 1;
        
        console.log("Next ID:", nextId);

        console.log("Attempting INSERT...");
        await conn.query(
            `INSERT INTO items (
                id, cartid, category_id, name, description, price_type, goods_item,
                price, price_s, price_m, price_l, price_xl, 
                in_menu_1, in_menu_2, in_menu_3, zutaten, show_menu
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nextId, val(newItem.cartid), val(newItem.category_id), val(newItem.name), val(newItem.description), val(newItem.price_type), val(newItem.goods_item),
                val(newItem.price), val(newItem.price_s), val(newItem.price_m), val(newItem.price_l), val(newItem.price_xl),
                val(newItem.in_menu_1), val(newItem.in_menu_2), val(newItem.in_menu_3), val(newItem.zutaten), val(newItem.show_menu)
            ]
        );
        console.log("INSERT successful!");
        
        // Cleanup
        await conn.query("DELETE FROM items WHERE id = ?", [nextId]);
        console.log("Cleanup successful.");

    } catch (err: any) {
        console.error("INSERT failed:", err);
        console.error("SQL Message:", err.sqlMessage);
        console.error("Code:", err.code);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

testInsert();
