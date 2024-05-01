import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '@/db/schema.js';

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.trim().email(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, 'id'>;
