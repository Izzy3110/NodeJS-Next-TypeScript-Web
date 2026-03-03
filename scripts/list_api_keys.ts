import { execSync, spawn, ChildProcess } from 'child_process';
import net from 'net';
import mariadb from 'mariadb';

async function isPortOpen(port: number, host: string = '127.0.0.1'): Promise<boolean> {
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

async function run() {
    let appProcess: ChildProcess | null = null;
    let pool;
    try {
        console.log("Checking if MariaDB is running on 127.0.0.1:3306...");
        let dbRunning = await isPortOpen(3306);
        
        if (!dbRunning) {
            console.log("MariaDB not running. Starting it...");
            try {
                execSync('cd docker-mariadb && docker-compose up -d', { stdio: 'inherit' });
                console.log("Waiting for MariaDB to initialize (10s)...");
                await sleep(10000);
            } catch (err) {
                console.error("Failed to start MariaDB:", err);
                process.exit(1);
            }
        } else {
            console.log("MariaDB is running.");
        }

        console.log("Checking if App is running on 127.0.0.1:3000...");
        let appRunning = await isPortOpen(3000);
        if (!appRunning) {
            console.log("App not running. Starting it via 'npm run dev'...");
            const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            appProcess = spawn(cmd, ['run', 'dev'], { 
                shell: true, 
                stdio: 'ignore' 
            });
            
            console.log("Waiting for App to be ready on 127.0.0.1:3000...");
            let attempts = 0;
            while (attempts < 30) {
                if (await isPortOpen(3000)) break;
                await sleep(2000);
                attempts++;
            }
            
            if (!(await isPortOpen(3000))) {
                console.error("Error: App failed to start on port 3000.");
                if (appProcess) {
                    if (process.platform === 'win32') execSync(`taskkill /pid ${appProcess.pid} /t /f`);
                    else appProcess.kill();
                }
                process.exit(1);
            }
            console.log("App started successfully.");
        } else {
            console.log("App is already running.");
        }

        console.log("\nFetching api_keys from database...");
        pool = mariadb.createPool({
            host: '127.0.0.1',
            user: 'dbuser',
            password: 'qwert',
            database: 'localdb',
            connectionLimit: 5
        });

        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM api_keys");
        conn.release();

        if (rows.length === 0) {
            console.log("No API keys found in the table.");
        } else {
            console.table(rows);
        }

    } catch (err) {
        console.error("Error listing keys:", err);
    } finally {
        if (pool) await pool.end();
        if (appProcess) {
            console.log("Stopping the App process...");
            if (process.platform === 'win32' && appProcess.pid) {
                try {
                    execSync(`taskkill /pid ${appProcess.pid} /t /f`);
                } catch (e) {
                    appProcess.kill();
                }
            } else {
                appProcess.kill();
            }
        }
        process.nextTick(() => process.exit(0));
    }
}

run();
