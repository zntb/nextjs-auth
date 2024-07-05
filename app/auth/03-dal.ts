import 'server-only';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { users } from '@/drizzle/schema';
import { verifySession } from '@/app/auth/02-stateless-session';

export const getUser = cache(async () => {
  try {
    const session = await verifySession();
    if (!session) {
      console.log('No session found');
      return null;
    }
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .execute();
    if (!user || user.length === 0) {
      console.log('No user found');
      return null;
    }
    return user[0];
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
});
