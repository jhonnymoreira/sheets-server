import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ID_LENGTH, contacts } from '@/db/schema.js';

export const insertContactSchema = createInsertSchema(contacts, {
  email: ({ email }) => email.trim().email(),
  firstName: ({ firstName }) => firstName.trim().min(1),
  lastName: z.union([z.undefined(), z.string().min(1).max(50)]),
  spreadsheetId: ({ spreadsheetId }) => spreadsheetId.trim().length(ID_LENGTH),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = Omit<z.infer<typeof insertContactSchema>, 'id'>;
