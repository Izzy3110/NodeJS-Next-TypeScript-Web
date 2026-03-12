import { NextRequest, NextResponse } from 'next/server';
import { prepareInvoiceData } from '@/lib/invoice/preparation';
import { createInvoice } from '@/lib/invoice/generation';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
    const { itemIds, lang, client } = body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'itemIds are required and must be a non-empty array.' },
        { status: 400 }
      );
    }

    // 1. Prepare data
    const data = await prepareInvoiceData(itemIds);

    // Pass language if provided
    if (lang) {
      (data as any).lang = lang;
    }

    // Override client data if provided in request body
    if (client) {
      (data as any).summary.client = {
        ...(data as any).summary.client,
        ...client,
        address: {
          ...(data as any).summary.client.address,
          ...(client.address || {}),
        },
      };
    }

    // 2. Generate PDF
    const result = await createInvoice(data);

    // 3. Return result
    return NextResponse.json({
      success: true,
      filePath: result.filePath,
      fileName: result.fileName,
      fileSize: result.fileSize
    });

  } catch (err: any) {
    console.error('API Error generating invoice:', err);
    return NextResponse.json(
      { 
        error: 'Failed to generate invoice PDF', 
        details: err.message,
        stack: err.stack,
        itemIds: body.itemIds
      },
      { status: 500 }
    );
  }
}
