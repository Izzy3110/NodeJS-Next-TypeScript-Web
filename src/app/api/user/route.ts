import { NextResponse } from 'next/server';
import { createUser, getUserByUsername, getUserByEmail, updateUser, deleteUser, getAllUsers } from '@/db';
import { hashPassword } from '@/lib/auth';

const USERNAME_REGEX = /^[a-zA-Z_]+$/;

export async function GET() {
    try {
        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (err) {
        console.error("Error in GET /api/user:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, email } = body;
        const username = body.username || body.user;

        if ((!username || !password) || (!email|| !password)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (username.length > 16 || !USERNAME_REGEX.test(username)) {
            return NextResponse.json({ error: 'Invalid username. Max 16 chars, only underscores and a-zA-Z allowed.' }, { status: 400 });
        }

        if (password.length > 255) {
            return NextResponse.json({ error: 'Password too long' }, { status: 400 });
        }

        if (email.length > 128) {
            return NextResponse.json({ error: 'Email too long' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        const existingEmail = await getUserByEmail(email);
        if (existingEmail) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const unixTimeStamp = Math.floor(Date.now() / 1000);

        const newUser = await createUser({
            username,
            password: hashedPassword,
            email,
            created: unixTimeStamp
        });

        // Don't return the password
        const { password: _, ...userResponse } = newUser;
        return NextResponse.json(userResponse, { status: 201 });
    } catch (err) {
        console.error("Error in POST /api/user:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, password, email } = body;
        const username = body.username || body.user;

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const updates: any = {};
        const unixTimeStamp = Math.floor(Date.now() / 1000);
        updates.created = unixTimeStamp; // OnUpdate behavior requested

        if (username) {
            if (username.length > 16 || !USERNAME_REGEX.test(username)) {
                return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
            }
            updates.username = username;
        }

        if (password) {
            if (password.length > 255) {
                return NextResponse.json({ error: 'Password too long' }, { status: 400 });
            }
            updates.password = await hashPassword(password);
        }

        if (email) {
            if (email.length > 128) {
                return NextResponse.json({ error: 'Email too long' }, { status: 400 });
            }
            updates.email = email;
        }

        await updateUser(id, updates);
        return NextResponse.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error("Error in PUT /api/user:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        await deleteUser(Number(id));
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error in DELETE /api/user:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
