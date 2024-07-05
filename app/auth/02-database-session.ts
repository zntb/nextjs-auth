import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/app/auth/definitions';
import { sessions } from '@/drizzle/schema';
import { db } from '@/drizzle/db';

const secretKey = process.env.SECRET;
if (!secretKey) {
  throw new Error('Secret key is not defined in environment variables');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1hr')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session:', error);
    return null;
  }
}

export async function createSession(id: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    // 1. Create a session in the database
    const data = await db
      .insert(sessions)
      .values({
        userId: id,
        expiresAt,
      })
      // Return the session ID
      .returning({ id: sessions.id });

    if (data.length === 0) {
      throw new Error('Failed to create session in the database');
    }

    const sessionId = data[0].id;

    // 2. Encrypt the session ID
    const session = await encrypt({ userId: id, expiresAt });

    // 3. Store the session in cookies for optimistic auth checks
    cookies().set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    console.log(`Session created successfully: ${sessionId}`);
  } catch (error) {
    console.error('Error creating session:', error);
  }
}
