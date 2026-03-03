import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as pingGET } from './ping/route';
import { GET as dataGET } from './data/route';
import { POST as itemsPOST } from './items/route';
import { POST as categoriesPOST } from './categories/route';
import pool from '@/db';
import { NextResponse } from 'next/server';

vi.mock('@/db', async () => {
    const actual = await vi.importActual('../../../utils/dbUtils');
    return {
        ...actual,
        default: {
            getConnection: vi.fn()
        }
    };
});

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options }))
    }
}));

describe('Admin Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/admin/ping', () => {
        it('should return 200 OK', async () => {
            const response = await pingGET();
            expect(response).toBeDefined();
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'ok' })
            );
        });
    });

    describe('GET /api/admin/data', () => {
        it('should return 200 with data', async () => {
            const mockConn = {
                query: vi.fn().mockResolvedValueOnce([{ count: 10 }]),
                release: vi.fn()
            };
            (pool.getConnection as any).mockResolvedValue(mockConn);

            const response = await dataGET();
            expect(response).toBeDefined();
            expect(mockConn.query).toHaveBeenCalled();
            expect(mockConn.release).toHaveBeenCalled();
        });

        it('should return 500 on error', async () => {
             const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (pool.getConnection as any).mockRejectedValue(new Error('DB Error'));

            await dataGET();
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.any(Object),
                { status: 500 }
            );
            consoleSpy.mockRestore();
        });
    });

    describe('POST /api/admin/items', () => {
        it('should return 200 on success', async () => {
            const mockConn = {
                query: vi.fn()
                    .mockResolvedValueOnce([{ maxId: 5 }])
                    .mockResolvedValueOnce({ insertId: 6 }),
                release: vi.fn()
            };
            (pool.getConnection as any).mockResolvedValue(mockConn);

            const mockRequest = {
                json: vi.fn().mockResolvedValue({ name: 'Test Item', price: 10 })
            };

            const response = await itemsPOST(mockRequest as any);
            expect(response).toBeDefined();
            expect(mockConn.release).toHaveBeenCalled();
        });
    });

    describe('POST /api/admin/categories', () => {
        it('should return 200 on success', async () => {
            const mockConn = {
                query: vi.fn()
                    .mockResolvedValueOnce([{ maxId: 5 }])
                    .mockResolvedValueOnce({ insertId: 6 }),
                release: vi.fn()
            };
            (pool.getConnection as any).mockResolvedValue(mockConn);

            const mockRequest = {
                json: vi.fn().mockResolvedValue({ name: 'Test Category' })
            };

            const response = await categoriesPOST(mockRequest as any);
            expect(response).toBeDefined();
            expect(mockConn.release).toHaveBeenCalled();
        });
    });
});
