import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';
import { getEnvironmentVariables } from '@/shared/utils/index.js';

/**
 * Since the lambdas that will heavily use Drizzle uses Transaction Mode
 * due to the transient connections, it's a trade-off to expose the
 * connection string to the lambdas.
 *
 * @see https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-postgresjs
 */
const { DATABASE_CONNECTION_URL } = getEnvironmentVariables(
  z.object({
    DATABASE_CONNECTION_URL: z.string().trim().min(1),
  })
);

const pgClient = postgres(DATABASE_CONNECTION_URL);
const db = drizzle(pgClient);
export { db };
