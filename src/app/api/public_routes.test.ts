import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as menuGET } from './menu/route';
import { POST as ordersPOST } from './orders/route';
import { GET as pizzasGET } from './pizzas/route';
import { getMenu, createOrder } from '@/db';
import pool from '@/db';
import { NextResponse } from 'next/server';

vi.mock('@/db', async () => {
    const actual = await vi.importActual('../../utils/dbUtils');
    return {
        ...actual,
        getMenu: vi.fn(),
        createOrder: vi.fn(),
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

describe('Public Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/menu', () => {
        it('should return 200 with menu data', async () => {
            (getMenu as any).mockResolvedValue([{ id: 1, name: 'Pizza' }]);
            const response = await menuGET();
            expect(response).toBeDefined();
            expect(getMenu).toHaveBeenCalled();
        });

        it('should return 500 on failure', async () => {
            (getMenu as any).mockRejectedValue(new Error('Failed'));
            const response = await menuGET();
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.any(Object),
                { status: 500 }
            );
        });
    });

    describe('POST /api/orders', () => {
        it('should return 200 on success', async () => {
            (createOrder as any).mockResolvedValue({ id: 10, customerName: 'Sascha', total: 0 });

            const mockRequest = {
                json: vi.fn().mockResolvedValue({ 
                    customerName: 'Sascha',
                    items: [{ itemId: 1, quantity: 2 }]
                })
            };

            const response = await ordersPOST(mockRequest as any);
            expect(response).toBeDefined();
            expect(createOrder).toHaveBeenCalled();
        });
    });

    describe('GET /api/pizzas', () => {
        it('should return 200 with pizzas', async () => {
            const response = await pizzasGET();
            expect(response).toBeDefined();
            expect(NextResponse.json).toHaveBeenCalled();
        });
    });
});
