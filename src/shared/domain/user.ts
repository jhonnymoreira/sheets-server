import { createInsertSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { ID_LENGTH, users } from '@/db/schema.js';

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.trim().email(),
  githubHandler: (schema) => schema.githubHandler.trim().min(1),
  id: z.string().trim().length(ID_LENGTH).optional().default(nanoid(ID_LENGTH)),
});

export type User = typeof users.$inferSelect;
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, 'id'>;
