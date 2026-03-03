import pool from '../src/db';

async function main() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT id, content, filename FROM print_queue ORDER BY id DESC LIMIT 1");
        
        if (rows.length === 0) {
            console.log("No jobs in queue.");
            return;
        }

        const job = rows[0];
        const content = job.content;
        
        console.log(`Job ID: ${job.id}`);
        console.log(`Filename: ${job.filename}`);
        console.log(`Content Length: ${content.length}`);
        console.log(`Content (First 50): ${content.substring(0, 50)}`);
        console.log(`Content (Last 50): ${content.substring(content.length - 50)}`);
        
        // check for spaces
        const spaceCount = (content.match(/ /g) || []).length;
        console.log(`Space count: ${spaceCount}`);
        
        // check for newlines
        const newlineCount = (content.match(/\n/g) || []).length;
        console.log(`Newline count: ${newlineCount}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

main();
