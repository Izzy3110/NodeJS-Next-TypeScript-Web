import { describe, it, expect } from 'vitest';
import { parseVal, mapItemRow } from './utils/dbUtils';

describe('db utilities', () => {
    describe('parseVal', () => {
        it('should return 0 for null or undefined', () => {
            expect(parseVal(null)).toBe(0);
            expect(parseVal(undefined)).toBe(0);
        });

        it('should return the number if input is a number', () => {
            expect(parseVal(10.5)).toBe(10.5);
        });

        it('should parse string with comma correctly', () => {
            expect(parseVal('10,50')).toBe(10.5);
        });

        it('should parse string with dot correctly', () => {
            expect(parseVal('10.50')).toBe(10.5);
        });

        it('should return 0 for invalid strings', () => {
            expect(parseVal('abc')).toBe(0);
        });
    });

    describe('mapItemRow', () => {
        it('should correctly map a database row to an Item object', () => {
            const mockRow = {
                id: 1,
                cartid: 101,
                category_id: 2,
                name: 'Pizza Margherita',
                description: 'Classic pizza',
                price_type: 1,
                price: '8,50',
                price_s: '6,00',
                price_m: '8,50',
                price_l: '10,00',
                price_xl: '12,00',
                in_menu_1: 1,
                in_menu_2: 0,
                in_menu_3: 1,
                show_menu: 1,
                zutaten: 'Cheese, Tomato',
                goods_item: 0
            };

            const expected = {
                id: 1,
                cartid: 101,
                category_id: 2,
                name: 'Pizza Margherita',
                description: 'Classic pizza',
                price_type: 1,
                price: 8.5,
                price_s: 6.0,
                price_m: 8.5,
                price_l: 10.0,
                price_xl: 12.0,
                in_menu_1: 1,
                in_menu_2: 0,
                in_menu_3: 1,
                show_menu: 1,
                zutaten: 'Cheese, Tomato',
                goods_item: 0
            };

            expect(mapItemRow(mockRow)).toEqual(expected);
        });
    });
});
