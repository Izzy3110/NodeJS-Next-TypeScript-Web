import mariadb from 'mariadb';
import { Category, Item } from './types';

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'dbuser',
    password: process.env.DB_PASSWORD || 'qwert',
    database: process.env.DB_NAME || 'localdb',
    connectionLimit: 5,
    allowPublicKeyRetrieval: true
});

export async function getConnection() {
    try {
        const conn = await pool.getConnection();
        return conn;
    } catch (err) {
        console.error("Error connecting to database:", err);
        throw err;
    }
}

import { parseVal, mapItemRow } from './utils/dbUtils';

export default pool;

export { parseVal, mapItemRow } from './utils/dbUtils';

export async function getMenu(): Promise<Category[]> {
    let conn;
    try {
        conn = await pool.getConnection();
        const categories = await conn.query("SELECT * FROM itemcats ORDER BY order_id");
        const items = await conn.query("SELECT * FROM items ORDER BY id ASC");

        const menu: Category[] = categories.map((cat: any) => ({
            id: cat.id,
            order_id: cat.order_id,
            name: cat.name,
            description: cat.description,
            additional_text: cat.additional_text,
            pic_url: cat.pic_url,
            items: items
                .filter((item: any) => item.category_id === cat.order_id)
                .map((item: any) => mapItemRow(item))
        }));

        return menu;
    } catch (err) {
        console.error("Error fetching menu:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function createOrder(orderData: {
    email: string,
    client_name?: string,
    client_phone?: string,
    address: string,
    address_line_1?: string,
    address_line_2?: string,
    address_plz?: string | number,
    address_city?: string,
    items: any[],
    lang?: string,
    total_price: number,
    tax_total: number,
    delivery_costs: number,
    pdf_path?: string
}) {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Extract item IDs. If quantity is specified, we duplicate the ID for each quantity.
        const items = orderData.items;
        const itemIdsArray = items.flatMap(item => Array(item.quantity || 1).fill(item.itemId || item.id));
        const itemIdsStr = itemIdsArray.join(',');

        const timestamp = Math.floor(Date.now() / 1000);

        const query = `
            INSERT INTO orders (
                ItemIDs, order_text, timestamp, mail, client_name, client_phone, 
                client_address, address_line_1, address_line_2, address_plz, address_city, 
                lang, total_price, tax_total, delivery_costs, pdf_path, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const res = await conn.query(query, [
            itemIdsStr, 
            "", 
            timestamp, 
            orderData.email, 
            orderData.client_name || null,
            orderData.client_phone || null,
            orderData.address,
            orderData.address_line_1 || null,
            orderData.address_line_2 || null,
            orderData.address_plz || null,
            orderData.address_city || null,
            orderData.lang || 'de',
            orderData.total_price,
            orderData.tax_total,
            orderData.delivery_costs,
            orderData.pdf_path || null,
            'pending'
        ]);

        return { id: Number(res.insertId), ...orderData };
    } catch (err) {
        console.error("Error creating order:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function getOrders() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM orders ORDER BY id DESC");
        return rows;
    } catch (err) {
        console.error("Error fetching orders:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function getSettings(): Promise<Record<string, string>> {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT s_key, s_val FROM settings");
        const settings: Record<string, string> = {};
        rows.forEach((row: any) => {
            settings[row.s_key] = row.s_val;
        });
        return settings;
    } catch (err) {
        console.error("Error fetching settings:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function updateSetting(key: string, value: string): Promise<void> {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(
            "INSERT INTO settings (s_key, s_val) VALUES (?, ?) ON DUPLICATE KEY UPDATE s_val = VALUES(s_val)",
            [key, value]
        );
    } catch (err) {
        console.error("Error updating setting:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function ensureUsersTable() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Ensure users table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(16) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(128) NOT NULL UNIQUE,
                last_login INT,
                created INT NOT NULL
            )
        `);

        // Ensure api_keys table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                created INT NOT NULL,
                api_key VARCHAR(255) NOT NULL UNIQUE
            )
        `);

        // Check if user_id column exists
        const columns = await conn.query("SHOW COLUMNS FROM api_keys LIKE 'user_id'");
        if (columns.length === 0) {
            console.log("Migrating api_keys table: adding user_id column");
            await conn.query(`
                ALTER TABLE api_keys 
                ADD COLUMN user_id INT,
                ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            `);
        }
    } catch (err) {
        console.error("Error ensuring tables exist:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function createUser(userData: any) {
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(
            "INSERT INTO users (username, password, email, created) VALUES (?, ?, ?, ?)",
            [userData.username, userData.password, userData.email, userData.created]
        );
        return { id: Number(res.insertId), ...userData };
    } catch (err) {
        console.error("Error creating user:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function getUserByUsername(username: string) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        return rows[0];
    } catch (err) {
        console.error("Error getting user by username:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function getUserByEmail(email: string) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    } catch (err) {
        console.error("Error getting user by email:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function getAllUsers() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT id, username, email, last_login, created FROM users");
        return rows;
    } catch (err) {
        console.error("Error getting all users:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function updateUser(id: number, updates: any) {
    let conn;
    try {
        conn = await pool.getConnection();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const query = `UPDATE users SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
        await conn.query(query, [...values, id]);
    } catch (err) {
        console.error("Error updating user:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function deleteUser(id: number) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM users WHERE id = ?", [id]);
    } catch (err) {
        console.error("Error deleting user:", err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}
