
import { execSync } from 'child_process';
import * as path from 'path';

const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

function run(scriptName: string) {
    console.log(`\n>>> Running ${scriptName} <<<`);
    try {
        // Enforce tsconfig.scripts.json for all child processes
        execSync(`npx ts-node -P tsconfig.scripts.json ${path.join(SCRIPTS_DIR, scriptName)}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`!!! Failed to run ${scriptName} !!!`);
        process.exit(1);
    }
}

async function main() {
    console.log("Starting Migration Process V3...");
    
    // 1. Full Backup
    run('backup_full.ts');
    
    // 2. Apply V3 Schema Changes
    run('setup_translations_v3.ts');
    
    console.log("\n>>> ALL DONE SUCCESSFULLY <<<");
}

main();
