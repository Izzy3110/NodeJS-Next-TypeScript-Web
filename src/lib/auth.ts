import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

/**
 * Hashes a password using scrypt.
 * @param password The plain text password to hash.
 * @returns A string containing the salt and hash in hex format.
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against a hash.
 * @param password The plain text password to verify.
 * @param hash The stored hash (salt:hash hex).
 * @returns True if the password matches, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return key === derivedKey.toString('hex');
}
