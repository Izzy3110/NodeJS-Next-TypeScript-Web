import { NextResponse } from 'next/server';
import { createOrder } from '@/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, items } = body;

        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: 'Invalid order data' }, { status: 400 });
        }

        // Calculate total (placeholder as per original code)
        const total = 0; 

        const order = await createOrder(customerName, items, total);
        return NextResponse.json(order, { status: 201 });
    } catch (err: any) {
        console.error("Order creation failed:", err);
        return NextResponse.json(
            { message: 'Failed to place order', error: err.message, sqlMessage: err.sqlMessage },
            { status: 500 }
        );
    }
}
