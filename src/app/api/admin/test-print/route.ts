import { NextResponse } from 'next/server';
import pool from '@/db';
import fs from 'fs';
import path from 'path';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { InvoiceData } from '@/types';

export async function POST() {
    let conn;
    try {
        conn = await pool.getConnection();

        // 1. Fetch latest API key
        const [apiKeyRow]: any = await conn.query("SELECT id, api_key FROM api_keys ORDER BY created DESC LIMIT 1");
        if (!apiKeyRow) {
            return NextResponse.json({ error: 'No API key found' }, { status: 400 });
        }
        const apiKeyId = apiKeyRow.id;

        // 2. Fetch Item 153 for dummy data
        const [item]: any = await conn.query("SELECT * FROM items WHERE id = 153");
        if (!item) {
            return NextResponse.json({ error: 'Item 153 not found' }, { status: 404 });
        }

        // 3. Prepare Dummy Invoice Data
        const now = new Date();
        const itemPrice = Number(item.price) || 9.99;
        const deliveryCosts = 2.50;
        const totalAmount = itemPrice + deliveryCosts;

        const invoiceData: InvoiceData = {
            invoiceNumber: `TEST-${Date.now()}`,
            date: now,
            customer: {
                name: "Test Customer",
                street: "Test Street 123",
                zipCode: "12345",
                city: "Test City",
                country: "Germany"
            },
            items: [
                {
                    description: item.name || "Test Item",
                    details: item.description || "Testing PDF Generation",
                    quantity: 1,
                    unitPrice: itemPrice,
                    totalPrice: itemPrice
                }
            ],
            deliveryCosts: deliveryCosts,
            totalAmount: totalAmount,
            currency: "EUR"
        };

        // 4. Generate PDF
        const doc = await generateInvoicePDF(invoiceData);
        const arrayBuffer = doc.output('arraybuffer');
        const buffer = Buffer.from(arrayBuffer);

        // 5. Prepare PDF Filename and Save Locally (optional, but keep it as consistent with original code)
        const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\./g, '');
        const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '');
        const ms = now.getMilliseconds().toString().padStart(3, '0');
        const filename = `Test-Invoice_${dateStr}-${timeStr}.${ms}.pdf`;
        
        const dataDir = path.join(process.cwd(), 'data', 'print-jobs');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        const filePath = path.join(dataDir, filename);
        fs.writeFileSync(filePath, buffer);

        // 6. Convert to Base64
        const content = buffer.toString('base64');

        // 7. Queue Job
        const unixTimeStamp = Math.floor(Date.now() / 1000);
        await conn.query(
            "INSERT INTO print_queue (api_key_id, content, filename, created_at) VALUES (?, ?, ?, ?)",
            [apiKeyId, content, filename, unixTimeStamp]
        );

        return NextResponse.json({ 
            status: 'success', 
            message: 'Test print job queued', 
            filename,
            apiKeyId 
        });

    } catch (err) {
        console.error("Error in test-print:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
