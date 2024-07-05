import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/app/auth/definitions';
import { sessions } from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { createLocalSession } from './02-stateless-session';

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

export async function createDbSession(userId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    const data = await db
      .insert(sessions)
      .values({
        userId: userId,
        expiresAt: expiresAt,
      })
      .returning({ id: sessions.id });

    if (data.length === 0) {
      throw new Error('Failed to create session in the database');
    }

    const sessionId = data[0].id;
    const session = await encrypt({ userId: userId, expiresAt: expiresAt });

    createLocalSession(session, expiresAt);

    console.log(`Session created successfully: ${sessionId}`);
  } catch (error) {
    console.error('Error creating session:', error);
  }
}

export async function deleteDbSession(userId: number) {
  try {
    // Get session from cookies
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      console.log('No session cookie found');
      return { success: false };
    }
    console.log('Session cookie:', sessionCookie);

    // Decrypt session
    const session = await decrypt(sessionCookie);
    if (!session) {
      console.log('Failed to decrypt session');
      return { success: false };
    }
    console.log('Decrypted session:', session);

    // Verify session user ID
    if (session.userId !== userId) {
      console.log('Session userId mismatch:', session.userId, '!==', userId);
      return { success: false };
    }

    // Delete session from the database
    const response = await db
      .delete(sessions)
      .where(eq(sessions.userId, userId));

    if (!response) {
      console.log('Failed to delete session from the database');
      return { success: false };
    }
    console.log('Session deleted from database');

    // Delete session from cookies
    cookies().delete('session');
    console.log('Session cookie deleted');

    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);
    return { success: false };
  }
}
