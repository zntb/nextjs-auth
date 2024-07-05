import 'dotenv/config';
// import '@/drizzle/envConfig';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.NEON_DATABASE_URL!,
  },
  out: './migrations',
});
