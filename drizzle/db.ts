import '@/drizzle/envConfig';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, NewUser } from './schema';
import * as schema from './schema';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);
export const db = drizzle(sql, { schema });

export const insertUser = async (user: NewUser) => {
  return db.insert(users).values(user).returning();
};
