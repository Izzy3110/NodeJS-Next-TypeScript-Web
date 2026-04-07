import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/db';
import { prepareInvoiceData } from '@/lib/invoice/preparation';
import { createInvoice } from '@/lib/invoice/generation';
import { createOrder } from '@/db';

// ──────────────────────────────────────────────────────────────────────────────
// Mock client used when no client is supplied in the request body
// ──────────────────────────────────────────────────────────────────────────────
const MOCK_CLIENT = {
  name: 'Gast',
  email: 'gast@example.de',
  tel: [],
  address: {
    client_address_line_1: '',
    client_address_line_2: '',
    client_address_plz: '',
    client_address_city: '',
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Helper: pick N random elements (with repetition) from an array
// ──────────────────────────────────────────────────────────────────────────────
// Picks n item IDs at random (with repetition) from an array of DB rows
function pickRandom(arr: { id: number | string }[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(Number(arr[Math.floor(Math.random() * arr.length)].id));
  }
  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/submit_order
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Resolve API Key for Printer Poll ───────────────────────────
    // We prioritize the key provided in the Authorization header.
    // If none (public order), we fallback to the system key in .env.local.
    
    let apiKeyId: number | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      let requestApiKey = authHeader;
      if (requestApiKey.startsWith('Bearer ')) {
        requestApiKey = requestApiKey.substring(7);
      }

      const validKeyRows: any = await conn.query(
        'SELECT id FROM api_keys WHERE api_key = ?',
        [requestApiKey]
      );
      if (validKeyRows.length > 0) {
        apiKeyId = validKeyRows[0].id;
      } else {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    }

    // If no header key was found/valid, try the system key fallback
    if (!apiKeyId) {
      let systemApiKey = process.env.API_KEY;
      
      // Fallback: manually read .env.local if process.env is empty
      if (!systemApiKey) {
        try {
          const envPath = path.join(process.cwd(), '.env.local');
          if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/^API_KEY=(.*)$/m);
            if (match) {
              systemApiKey = match[1].trim();
            }
          }
        } catch (e) {
          console.error("Failed to read .env.local manually:", e);
        }
      }

      if (systemApiKey) {
        const keyRows: any = await conn.query(
          'SELECT id FROM api_keys WHERE api_key = ?',
          [systemApiKey]
        );
        if (keyRows.length > 0) {
          apiKeyId = keyRows[0].id;
        }
      }
    }

    // 2. Parse body (optional) ──────────────────────────────────────────────
    let itemIds: number[] | undefined;
    let lang = 'de';
    let client: any = undefined;

    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text);
        if (body.itemIds && Array.isArray(body.itemIds) && body.itemIds.length > 0) {
          itemIds = body.itemIds.map(Number);
        }
        if (body.lang) lang = body.lang;
        if (body.client) client = body.client;
      }
    } catch {
      // ignore JSON parse errors – treat as empty body → mock order
    }

    // 3. Mock order if no itemIds provided ──────────────────────────────────
    if (!itemIds || itemIds.length === 0) {
      const allItems: any = await conn.query('SELECT id FROM items LIMIT 100');
      if (!allItems || allItems.length === 0) {
        return NextResponse.json(
          { error: 'No items found in database to create a mock order.' },
          { status: 500 }
        );
      }
      itemIds = pickRandom(allItems, Math.floor(Math.random() * 4) + 2);
    }

    // 4. Prepare invoice data ───────────────────────────────────────────────
    const data = await prepareInvoiceData(itemIds);
    (data as any).lang = lang;

    // Apply client overrides
    const baseClient = client ? data.summary.client : MOCK_CLIENT;
    const finalClient = {
      ...baseClient,
      ...(client || {}),
      address: {
        ...baseClient.address,
        ...((client && client.address) || {}),
      },
    };
    (data as any).summary.client = finalClient;

    // 5. Generate PDF ───────────────────────────────────────────────────────
    const result = await createInvoice(data);

    // 6. Persist to Orders Table ────────────────────────────────────────────
    const summary = data.summary;
    await createOrder({
      email: finalClient.email,
      client_name: finalClient.name,
      client_phone: finalClient.tel ? finalClient.tel[0] : undefined,
      address: `${finalClient.address.client_address_line_1}, ${finalClient.address.client_address_plz} ${finalClient.address.client_address_city}`,
      address_line_1: finalClient.address.client_address_line_1,
      address_line_2: finalClient.address.client_address_line_2,
      address_plz: finalClient.address.client_address_plz,
      address_city: finalClient.address.client_address_city,
      items: data.items,
      lang: lang,
      total_price: summary.total,
      tax_total: summary.tax_value,
      delivery_costs: summary.delivery_costs,
      pdf_path: result.filePath
    });

    // 7. Queue for Printing ─────────────────────────────────────────────────
    let printQueueId: number | null = null;
    if (apiKeyId) {
      const fileBuffer = fs.readFileSync(result.filePath);
      const base64Content = fileBuffer.toString('base64');

      // Ensure print_queue table exists
      await conn.query(`
        CREATE TABLE IF NOT EXISTS print_queue (
          id INT AUTO_INCREMENT PRIMARY KEY,
          api_key_id INT,
          content LONGTEXT,
          filename VARCHAR(255),
          created_at INT,
          FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
        )
      `);

      const unixTimestamp = Math.floor(Date.now() / 1000);
      const insertResult: any = await conn.query(
        'INSERT INTO print_queue (api_key_id, content, filename, created_at) VALUES (?, ?, ?, ?)',
        [apiKeyId, base64Content, result.fileName, unixTimestamp]
      );
      printQueueId = Number(insertResult.insertId ?? insertResult[0]?.insertId ?? 0);
    }

    // 8. Return ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      usedItemIds: itemIds,
      filePath: result.filePath,
      fileName: result.fileName,
      fileSize: result.fileSize,
      printQueueId,
      message: apiKeyId ? "Order submitted and queued for printing" : "Order submitted (printing skipped: no system API_KEY found)"
    });

  } catch (err: any) {
    console.error('API Error in submit_order:', err);
    return NextResponse.json(
      { error: 'Failed to submit order', details: err.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
