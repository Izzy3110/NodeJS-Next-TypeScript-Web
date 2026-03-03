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

async function run() {
    let appProcess: ChildProcess | null = null;
    try {
        // Suppress logs for the clean output unless something fails
        const log = (msg: string) => {}; 
        // Use console.error for issues

        let dbRunning = await isPortOpen(3306);
        if (!dbRunning) {
            try {
                execSync('cd docker-mariadb && docker-compose up -d', { stdio: 'pipe' });
                await sleep(10000);
            } catch (err) {
                console.error("Failed to start MariaDB");
                process.exit(1);
            }
        }

        let appRunning = await isPortOpen(3000);
        if (!appRunning) {
            const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            appProcess = spawn(cmd, ['run', 'dev'], { 
                shell: true, 
                stdio: 'ignore' 
            });
            
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
        }

        const baseUrl = 'http://127.0.0.1:3000';
        const genKeyRes = await httpRequest(`${baseUrl}/api/generate_api_key`, 'POST');
        
        if (genKeyRes.data && genKeyRes.data.api_key) {
            console.log(genKeyRes.data.api_key);
        } else {
            console.error("Failed to generate API key:", genKeyRes.data);
            process.exit(1);
        }

    } catch (err) {
        console.error("Error generating key:", err);
        process.exit(1);
    } finally {
        if (appProcess) {
            if (process.platform === 'win32' && appProcess.pid) {
                try {
                    execSync(`taskkill /pid ${appProcess.pid} /t /f`);
                } catch (e) {}
            } else {
                appProcess.kill();
            }
        }
        process.nextTick(() => process.exit(0));
    }
}

run();
