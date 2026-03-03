import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import pool, { getUserByUsername, getUserByEmail } from '../../../db';
import { verifyPassword } from '../../../lib/auth';
import { NextResponse } from 'next/server';

vi.mock('../../../db', () => ({
    default: {
        getConnection: vi.fn()
    },
    getUserByUsername: vi.fn(),
    getUserByEmail: vi.fn()
}));

vi.mock('../../../lib/auth', () => ({
    verifyPassword: vi.fn()
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options }))
    }
}));

describe('generate_api_key API route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate an API key for an authenticated user', async () => {
        const mockUser = { id: 1, username: 'admin', password: 'hashed_password' };
        (getUserByUsername as any).mockResolvedValue(mockUser);
        (verifyPassword as any).mockResolvedValue(true);

        const mockConn = {
            query: vi.fn().mockResolvedValue({ insertId: 1 }),
            release: vi.fn()
        };
        (pool.getConnection as any).mockResolvedValue(mockConn);

        const mockRequest = {
            json: vi.fn().mockResolvedValue({ user: 'admin', password: 'password123' })
        };

        const response = await POST(mockRequest as any);

        expect(getUserByUsername).toHaveBeenCalledWith('admin');
        expect(verifyPassword).toHaveBeenCalledWith('password123', 'hashed_password');
        expect(pool.getConnection).toHaveBeenCalled();
        expect(mockConn.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO api_keys'),
            expect.arrayContaining([expect.any(Number), expect.any(String), 1])
        );
        
        const resData = (response as any).data;
        expect(resData.apiKey).toMatch(/^sk_[a-f0-9]+$/);
        expect(resData.user).toBe('admin');
    });

    it('should return 401 if authentication fails', async () => {
        (getUserByUsername as any).mockResolvedValue(null);
        const mockRequest = {
            json: vi.fn().mockResolvedValue({ user: 'wrong_user', password: 'password123' })
        };

        const response = await POST(mockRequest as any);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    });

    it('should return 500 if database connection fails', async () => {
        const mockUser = { id: 1, username: 'admin', password: 'hashed_password' };
        (getUserByUsername as any).mockResolvedValue(mockUser);
        (verifyPassword as any).mockResolvedValue(true);
        (pool.getConnection as any).mockRejectedValue(new Error('DB Error'));

        const mockRequest = {
            json: vi.fn().mockResolvedValue({ user: 'admin', password: 'password123' })
        };

        const response = await POST(mockRequest as any);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    });
});
