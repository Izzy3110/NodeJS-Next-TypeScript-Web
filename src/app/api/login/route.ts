import { NextResponse } from 'next/server';
import { getUserByUsername, getUserByEmail, updateUser } from '@/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        const username = body.username || body.user;

        if ((!username && !email) || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
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

        // Update last_login
        const unixTimeStamp = Math.floor(Date.now() / 1000);
        await updateUser(user.id, { last_login: unixTimeStamp });

        // Don't return the password
        const { password: _, ...userResponse } = user;
        return NextResponse.json({
            message: 'Login successful',
            user: { ...userResponse, last_login: unixTimeStamp }
        });
    } catch (err) {
        console.error("Error in POST /api/login:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
