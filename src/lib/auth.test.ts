import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('auth utilities', () => {
    it('should hash a password and verify it', async () => {
        const password = 'password123';
        const hash = await hashPassword(password);
        
        expect(hash).toContain(':');
        const [salt, key] = hash.split(':');
        expect(salt).toHaveLength(32); // 16 bytes in hex
        expect(key).toHaveLength(128); // 64 bytes in hex

        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
    });

    it('should not verify an incorrect password', async () => {
        const password = 'password123';
        const hash = await hashPassword(password);
        
        const isValid = await verifyPassword('wrongpassword', hash);
        expect(isValid).toBe(false);
    });

    it('should produce different hashes for the same password due to random salt', async () => {
        const password = 'password123';
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);
        
        expect(hash1).not.toBe(hash2);
    });
});
