import { NextResponse } from 'next/server';
import { pizzas } from '@/data';

export async function GET() {
    return NextResponse.json(pizzas);
}
