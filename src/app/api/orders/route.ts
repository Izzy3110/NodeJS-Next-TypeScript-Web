import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/db';

export async function GET() {
    try {
        const orders = await getOrders();
        return NextResponse.json(orders);
    } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        return NextResponse.json(
            { message: 'Failed to fetch orders', error: err.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, address, items } = body;

        if (!email || !address || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: 'Invalid order data' }, { status: 400 });
        }

        // Calculate total (placeholder as per original code)
        const total = 0; 

        const order = await createOrder(email, address, items, total);
        return NextResponse.json(order, { status: 201 });
    } catch (err: any) {
        console.error("Order creation failed:", err);
        return NextResponse.json(
            { message: 'Failed to place order', error: err.message, sqlMessage: err.sqlMessage },
            { status: 500 }
        );
    }
}
