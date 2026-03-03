import { NextResponse } from 'next/server';
import pool, { getUserByUsername, getUserByEmail } from '@/db';
import crypto from 'crypto';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
    let conn;
    try {
        const body = await request.json();
        const { password, email } = body;
        const username = body.username || body.user;

        if ((!username && !email) || !password) {
            return NextResponse.json({ error: 'Authentication required: provide username/email and password' }, { status: 401 });
        }

        let user;
        if (username) {
            user = await getUserByUsername(username);
        } else if (email) {
            user = await getUserByEmail(email);
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const apiKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
        const unixTimeStamp = Math.floor(Date.now() / 1000);

        conn = await pool.getConnection();

        await conn.query(
            "INSERT INTO api_keys (created, api_key, user_id) VALUES (?, ?, ?)",
            [unixTimeStamp, apiKey, user.id]
        );

        return NextResponse.json({ apiKey, unixTimeStamp, user: user.username });
    } catch (err) {
        console.error("Error generating API key:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
