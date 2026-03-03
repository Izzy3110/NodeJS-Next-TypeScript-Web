import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.name.replace(/\s+/g, '_');
        
        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public/images/categories');
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const relativePath = `images/categories/${filename}`;
        return NextResponse.json({ success: true, path: relativePath });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
