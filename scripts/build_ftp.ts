import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const BUILD_DIR = path.join(process.cwd(), '.next', 'standalone');
const NEXT_DIR = path.join(process.cwd(), '.next');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const DIST_ZIP = path.join(process.cwd(), 'deploy_ftp.zip');

async function buildAndZip() {
    console.log("Starting build for FTP deployment (Standalone Mode)...");

    // 1. Run Next.js build
    try {
        console.log("Running npm run build...");
        execSync('npm run build', { stdio: 'inherit' });
    } catch (err) {
        console.error("Build failed.", err);
        process.exit(1);
    }

    if (!fs.existsSync(BUILD_DIR)) {
        console.error(`Standalone build directory not found at ${BUILD_DIR}. Ensure output: 'standalone' is in next.config.ts.`);
        process.exit(1);
    }

    console.log("Copying required static files...");
    
    // 2. Copy .next/static into .next/standalone/.next/static
    const standaloneNextDir = path.join(BUILD_DIR, '.next');
    if (!fs.existsSync(standaloneNextDir)) {
        fs.mkdirSync(standaloneNextDir, { recursive: true });
    }
    const publicOriginStaticPath = path.join(NEXT_DIR, 'static');
    const standaloneStaticPath = path.join(standaloneNextDir, 'static');
    
    if (fs.existsSync(publicOriginStaticPath)) {
        copyFolderSync(publicOriginStaticPath, standaloneStaticPath);
        console.log("Copied .next/static");
    } else {
        console.log("No .next/static found to copy.");
    }

    // 3. Copy public folder
    const standalonePublicPath = path.join(BUILD_DIR, 'public');
    if (fs.existsSync(PUBLIC_DIR)) {
        copyFolderSync(PUBLIC_DIR, standalonePublicPath);
        console.log("Copied public assets");
    } else {
        console.log("No public folder found to copy.");
    }

    // 4. Zip the standalone folder
    console.log(`Zipping standalone build into ${DIST_ZIP}...`);
    const output = fs.createWriteStream(DIST_ZIP);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`\n✅ Deployment file ready: deploy_ftp.zip (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
        console.log("\nTo deploy:");
        console.log("1. Upload deploy_ftp.zip to your server via FTP.");
        console.log("2. Extract the zip file on the server.");
        console.log("3. Configure your server's Node.js app to point to 'server.js' as the startup file.");
    });

    archive.on('error', (err: any) => {
        throw err;
    });

    archive.pipe(output);

    // Add the standalone directory contents to the zip root
    archive.directory(BUILD_DIR, false);

    await archive.finalize();
}

function copyFolderSync(from: string, to: string) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

buildAndZip().catch(console.error);
