import dotenv from 'dotenv';
import path from 'path';
import net from 'net';
import mariadb from 'mariadb';
import axios, { AxiosError, AxiosResponse } from 'axios';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
let token = null

let baseHost_url = "https://pizzaservice-pfullendorf.de"

let valid_endpoints = {
    "verify_api_key": {
        "method": "POST",
        "endpoint": "/api/verify_api_key",
    },
    "generate_api_key": {
        "method":  "POST",
        "endpoint":  "/api/generate_api_key"   
    },
}


async function testToken(token) {
    // if (token) return token;
    const response = await axios.get(`${baseHost_url}${valid_endpoints.verify_api_key.endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

async function createToken() {
    const response = await axios.post(`${baseHost_url}${valid_endpoints.generate_api_key.endpoint}`, {
        "username": "admin",
        "password": "admin"
    });
    let data = response.data;
    let apiKey = data.apiKey;

    return apiKey
}

async function isPortOpen(port: number, host: string = '127.0.0.1'): Promise<boolean> {
    console.log(`${host}:${port}`)
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.once('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host, () => {
            socket.end();
            resolve(true);
        });
    });
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getItems(col_name="id", table="api_keys") {
        const args = process.argv.slice(2);
        let col_value = parseInt(args[0]) || null;
        let table_ = table;
        if(args.length > 1) {
            table_ = args[1] || table;
        }
        let pool;
        let rows = []
        try {
            console.log("Checking if MariaDB is running on 127.0.0.1:3306...");
            let dbRunning = await isPortOpen(process.env.DB_PORT || 3306, process.env.DB_HOST);
            
            if (!dbRunning) {

            } else {
                console.log("MariaDB is running.");
            }

            pool = mariadb.createPool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                connectionLimit: 5
            });

            const conn = await pool.getConnection();
            const query = col_value != null ? `SELECT * FROM ${table_} WHERE ${col_name} = ?` : `SELECT * FROM ${table_}`;
            rows = await conn.query(query, col_value != null ? [col_value] : []);
            conn.release();

            if (rows.length === 0) {
                console.log("No API keys found in the table.");
            } else {
                return rows;
            }

        } catch (err) {
            console.error("Error listing keys:", err);
        } finally {
            if (pool) await pool.end();
            
        }
    }
async function getToken() {
        const args = process.argv.slice(2);
        let itemId = parseInt(args[0]) || null;
        if(args.length > 1) {
            console.log(args[1])
        }
        let pool;
        let rows = []
        try {
            console.log("Checking if MariaDB is running on 127.0.0.1:3306...");
            let dbRunning = await isPortOpen(process.env.DB_PORT || 3306, process.env.DB_HOST);
            
            if (!dbRunning) {

            } else {
                console.log("MariaDB is running.");
            }

            pool = mariadb.createPool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                connectionLimit: 5
            });

            const conn = await pool.getConnection();
            const query = itemId != null ? "SELECT * FROM api_keys WHERE id = ?" : "SELECT * FROM api_keys";
            rows = await conn.query(query, itemId != null ? [itemId] : []);
            conn.release();

            if (rows.length === 0) {
                console.log("No API keys found in the table.");
            } else {
                return rows[0].api_key;
            }

        } catch (err) {
            console.error("Error listing keys:", err);
        } finally {
            if (pool) await pool.end();
            
        }
    }

async function run() {
    const args = process.argv.slice(2);
    let create_api_key = args.includes('--create-api-key'); 
    let test_api_key = args.includes('--test-api-key'); 
    let data = null;
    if(test_api_key) {
        token = await getToken()

        let result = await testToken(token)
        console.log(result.valid == true ? "API Key is valid" : "API Key is invalid")
    } else if(create_api_key) {
        token = await createToken()
        console.log(token)
        let result = await testToken(token)
        console.log(result.valid == true ? "API Key is valid" : "API Key is invalid")
    } else {
        data = await getItems(   )
        console.table(data)
    }
}

run();
