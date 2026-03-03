import { execSync, spawn, ChildProcess } from 'child_process';
import net from 'net';
import http from 'http';

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

async function httpRequest(url: string, method: string, headers: any = {}, body: any = null): Promise<any> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function test() {
    let appProcess: ChildProcess | null = null;
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

        console.log("\nStarting API Tests (using 127.0.0.1 with http module)...");
        const baseUrl = 'http://127.0.0.1:3000';
        
        const genKeyRes = await httpRequest(`${baseUrl}/api/generate_api_key`, 'POST');
        console.log("Generate API Key Response:", genKeyRes.data);

        const apiKey = genKeyRes.data.api_key;
        if (apiKey) {
            const ipRes = await httpRequest(`${baseUrl}/api/ip-input`, 'POST', {
                'Authentication': apiKey
            }, { test: "data" });
            console.log("IP Input Response (Valid Key):", ipRes.data);
        }

        const failRes = await httpRequest(`${baseUrl}/api/ip-input`, 'POST', {
            'Authentication': 'invalid_key'
        }, { test: "data" });
        console.log("IP Input Response (Invalid Key):", failRes.status, failRes.data);

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
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

test();
