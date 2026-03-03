import { NextResponse } from 'next/server';
import { getSettings, updateSetting } from '@/db';

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json(settings);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, value } = body;
        
        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }
        
        await updateSetting(key, value);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }
}
