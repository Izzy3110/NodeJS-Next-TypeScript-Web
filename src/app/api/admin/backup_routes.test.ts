import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as backupPOST } from './backup/route';
import { GET as backupsGET } from './backups/route';
import pool from '@/db';
import { NextResponse } from 'next/server';
import fs from 'fs';

vi.mock('@/db', () => ({
    default: {
        getConnection: vi.fn()
    }
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options }))
    }
}));

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn().mockReturnValue(true),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn(),
        readdirSync: vi.fn().mockReturnValue([]),
        statSync: vi.fn().mockReturnValue({ mtime: new Date(), size: 100 })
    }
}));

describe('Backup Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/admin/backup', () => {
        it('should create a backup and return 200', async () => {
            const mockConn = {
                query: vi.fn().mockResolvedValue([]),
                release: vi.fn()
            };
            (pool.getConnection as any).mockResolvedValue(mockConn);

            const response = await backupPOST();
            expect(response).toBeDefined();
            expect(fs.writeFileSync).toHaveBeenCalled();
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, filename: expect.any(String) })
            );
        });

        it('should return 500 on error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (pool.getConnection as any).mockRejectedValue(new Error('DB Error'));

            await backupPOST();
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.any(Object),
                { status: 500 }
            );
            consoleSpy.mockRestore();
        });
    });

    describe('GET /api/admin/backups', () => {
        it('should return list of backups', async () => {
            (fs.readdirSync as any).mockReturnValue(['backup1.json']);
            
            const response = await backupsGET();
            expect(response).toBeDefined();
            expect(fs.readdirSync).toHaveBeenCalled();
        });
    });
});
