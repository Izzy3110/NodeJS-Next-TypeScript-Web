import { NextResponse } from 'next/server';
import { getMenu } from '@/db';

export async function GET() {
    try {
        const menu = await getMenu();
        return NextResponse.json(menu);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
    }
}
