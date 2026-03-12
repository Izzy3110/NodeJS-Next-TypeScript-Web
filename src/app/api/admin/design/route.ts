import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const CONFIG_PATH = path.join(process.cwd(), 'src/data/theme.json');

export async function GET() {
    try {
        const content = await fs.readFile(CONFIG_PATH, 'utf-8');
        const variables = JSON.parse(content);
        return NextResponse.json(variables);
    } catch (error: any) {
        console.error("Design GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const updates = await req.json();
        await fs.writeFile(CONFIG_PATH, JSON.stringify(updates, null, 2), 'utf-8');
        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Design POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
