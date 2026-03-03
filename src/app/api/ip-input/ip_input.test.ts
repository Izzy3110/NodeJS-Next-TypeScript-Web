import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import pool from '@/db';
import { NextResponse } from 'next/server';

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

describe('ip-input API route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if Authentication header is missing', async () => {
        const mockRequest = {
            headers: {
                get: vi.fn().mockReturnValue(null)
            }
        };

        await POST(mockRequest as any);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    });

    it('should return 401 if API key is invalid', async () => {
        const mockRequest = {
            headers: {
                get: vi.fn().mockReturnValue('invalid_key')
            }
        };
        const mockConn = {
            query: vi.fn().mockResolvedValue([]), // No rows returned for API key
            release: vi.fn()
        };
        (pool.getConnection as any).mockResolvedValue(mockConn);

        await POST(mockRequest as any);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
        expect(mockConn.release).toHaveBeenCalled();
    });

    it('should process IP input successfully with valid key', async () => {
        const mockRequest = {
            headers: {
                get: vi.fn((name) => {
                    if (name === 'Authentication') return 'valid_key';
                    if (name === 'x-forwarded-for') return '192.168.1.1';
                    return null;
                })
            },
            json: vi.fn().mockResolvedValue({ some: 'data' })
        };
        const mockConn = {
            query: vi.fn()
                .mockResolvedValueOnce([{ id: 1 }]) // SELECT id FROM api_keys
                .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS pc_clients
                .mockResolvedValueOnce({ insertId: 10 }), // INSERT INTO pc_clients
            release: vi.fn()
        };
        (pool.getConnection as any).mockResolvedValue(mockConn);

        const response = await POST(mockRequest as any);

        expect(mockConn.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id FROM api_keys'), ['valid_key']);
        expect(mockConn.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO pc_clients'), ['192.168.1.1', expect.any(Number), 1]);
        
        const resData = (response as any).data;
        expect(resData.status).toBe('success');
    });
});
