'use server';

import { db } from '@/drizzle/db';
import { verifySession } from '@/app/auth/02-stateless-session';
import { deleteDbSession } from '@/app/auth/02-database-session';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '../auth/03-dal';

interface User {
  id: number;
  name: string;
  email: string;
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const dbUsers = await db.select().from(users);
    return dbUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export const deleteUser = async () => {
  console.log('deleteUser function called');

  // Verify session
  const session = await verifySession();
  if (!session) {
    console.log('Session verification failed');
    return { success: false };
  }
  console.log('Session verified:', session);

  // Get user
  const user = await getUser();
  if (!user) {
    console.log('User not found');
    return { success: false };
  }
  console.log('User found:', user);

  try {
    // Attempt to delete session
    console.log('Attempting to delete session for user id:', session.userId);
    const sessionDeleteResponse = await deleteDbSession(session.userId);

    // Ensure the session deletion was successful
    if (!sessionDeleteResponse) {
      console.log('Failed to delete session');
      return { success: false };
    }

    console.log('Session deleted successfully');

    // Attempt to delete user
    console.log('Attempting to delete user with id:', session.userId);
    const userDeleteResponse = await db
      .delete(users)
      .where(eq(users.id, session.userId));

    // Check the result of the delete operation
    console.log('Delete user response:', userDeleteResponse);

    if (!userDeleteResponse) {
      console.log('Failed to delete user');
      return { success: false };
    }

    console.log('User deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};
