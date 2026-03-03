import mariadb from 'mariadb';

async function main() {
    let conn;
    try {
        const pool = mariadb.createPool({
            host: '127.0.0.1',
            user: 'dbuser',
            password: 'qwert',
            database: 'localdb',
            connectionLimit: 5
        });

        conn = await pool.getConnection();
        const rows = await conn.query("SELECT id, content, filename FROM print_queue ORDER BY id DESC LIMIT 1");
        
        if (rows.length === 0) {
            console.log("No jobs in queue.");
            return;
        }

        const job = rows[0];
        const content = job.content; // This might be a buffer if BLOB or string if LONGTEXT
        
        console.log(`Job ID: ${job.id}`);
        console.log(`Filename: ${job.filename}`);
        console.log(`Content Type: ${typeof content}`);
        
        const textContent = content.toString(); // Ensure string
        console.log(`Content Length: ${textContent.length}`);
        console.log(`Content (First 50): ${textContent.substring(0, 50)}`);
        console.log(`Content (Last 50): ${textContent.substring(textContent.length - 50)}`);
        
        // check for spaces
        const spaceCount = (textContent.match(/ /g) || []).length;
        console.log(`Space count: ${spaceCount}`);
        
        // check for newlines
        const newlineCount = (textContent.match(/[\r\n]/g) || []).length;
        console.log(`Newline count: ${newlineCount}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

main();
