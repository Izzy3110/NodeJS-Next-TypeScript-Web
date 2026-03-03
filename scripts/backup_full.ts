import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function runBackup() {
    console.log("Starting Full Backup...");

    // 1. Database Backup via Helper Script
    try {
        console.log("Executing scripts/backup_db.bat...");
        // Use 'cmd.exe /c' to run the batch file
        execSync('cmd.exe /c scripts\\backup_db.bat', { stdio: 'inherit' });
    } catch (err) {
        console.error("Database backup failed.", err);
        process.exit(1);
    }

    // 2. File Backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipName = `project_backup_${timestamp}.zip`;
    const zipPath = path.join(BACKUP_DIR, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`File backup created: ${zipName} (${archive.pointer()} bytes)`);
    });

    archive.on('error', (err: any) => {
        throw err;
    });

    archive.pipe(output);

    // Add everything except node_modules, .next, .git, backups
    archive.glob('**/*', {
        cwd: process.cwd(),
        ignore: ['node_modules/**', '.next/**', '.git/**', 'backups/**']
    });

    await archive.finalize();
}

runBackup().catch(console.error);
