import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import * as process from 'node:process';

config();

export default defineConfig({
  breakpoints: false,
  dbCredentials: {
    connectionString: process.env['DATABASE_CONNECTION_URL']!,
  },
  driver: 'pg',
  out: './src/db/migrations/',
  schema: './src/db/schema.ts',
});
