import mariadb from 'mariadb';
import fs from 'fs';
import path from 'path';

const DB_CONFIG = {
    host: '127.0.0.1',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
};

const VERSION_FILE = path.join(process.cwd(), 'VERSION.md');
const PACKAGE_FILE = path.join(process.cwd(), 'package.json');

async function getDbVersion() {
    const pool = mariadb.createPool(DB_CONFIG);
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT version, datetime FROM version ORDER BY id DESC LIMIT 1");
        return rows.length > 0 ? rows[0] : null;
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

async function updateDbVersion(version: string) {
    const pool = mariadb.createPool(DB_CONFIG);
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("INSERT INTO version (version) VALUES (?)", [version]);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

function getLocalVersion() {
    if (!fs.existsSync(VERSION_FILE)) return null;
    return fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

function getPackageVersion() {
    if (!fs.existsSync(PACKAGE_FILE)) return null;
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf8'));
    return pkg.version;
}

function updateLocalVersion(version: string) {
    fs.writeFileSync(VERSION_FILE, version + '\n');
    
    if (fs.existsSync(PACKAGE_FILE)) {
        const pkg = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf8'));
        pkg.version = version;
        fs.writeFileSync(PACKAGE_FILE, JSON.stringify(pkg, null, 2) + '\n');
    }
}

function parseVersion(v: string) {
    const parts = v.split('.').map(Number);
    return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0
    };
}

function stringifyVersion(v: { major: number, minor: number, patch: number }) {
    return `${v.major}.${v.minor}.${v.patch}`;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--show')) {
        const dbV = await getDbVersion();
        if (dbV) {
            console.log(`Database Version: ${dbV.version} (Updated: ${dbV.datetime})`);
        } else {
            console.log("No version found in database.");
        }
        return;
    }

    if (args.includes('--compare')) {
        const dbV = await getDbVersion();
        const localV = getLocalVersion();
        const pkgV = getPackageVersion();
        
        console.log(`Local Version:    ${localV}`);
        console.log(`Package Version:  ${pkgV}`);
        console.log(`Database Version: ${dbV ? dbV.version : 'NONE'}`);
        
        const allMatch = localV === pkgV && localV === (dbV ? dbV.version : null);

        if (allMatch) {
            console.log("\x1b[32mVersions MATCH.\x1b[0m");
        } else {
            console.log("\x1b[31mVersions MISMATCH!\x1b[0m");
        }
        return;
    }

    if (args.includes('--upgrade')) {
        const localV = getLocalVersion();
        if (!localV) {
            console.error("Error: VERSION.md not found.");
            process.exit(1);
        }

        const v = parseVersion(localV);
        let upgraded = false;

        if (args.includes('--minor')) {
            v.patch += 1;
            upgraded = true;
        } else if (args.includes('--major')) {
            v.minor += 1;
            v.patch = 0;
            upgraded = true;
        } else if (args.includes('--main')) {
            v.major += 1;
            v.minor = 0;
            v.patch = 0;
            upgraded = true;
        }

        if (!upgraded) {
            console.error("Error: Please specify upgrade type (--minor, --major, or --main).");
            process.exit(1);
        }

        const nextV = stringifyVersion(v);
        console.log(`Upgrading from ${localV} to ${nextV}...`);

        updateLocalVersion(nextV);
        await updateDbVersion(nextV);

        console.log("\x1b[32mUpgrade successful. Local and DB versions updated.\x1b[0m");
        
        // Final verification
        const dbVerify = await getDbVersion();
        const localVerify = getLocalVersion();
        console.log(`Final Local: ${localVerify}, Final DB: ${dbVerify?.version}`);
        return;
    }

    console.log("Usage: npx tsx scripts/manage_versions.ts [--show | --compare | --upgrade [--minor | --major | --main]]");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
