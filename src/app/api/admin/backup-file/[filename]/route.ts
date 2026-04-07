import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }

    try {
        const content = fs.readFileSync(filepath, 'utf-8');
        return new NextResponse(content, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
            }
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Could not read backup' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;

    // Basic safety check for filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }

    try {
        fs.unlinkSync(filepath);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Could not delete backup' }, { status: 500 });
    }
}
