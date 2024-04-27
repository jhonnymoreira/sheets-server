import { createInsertSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { ID_LENGTH, spreadsheets } from '@/db/schema.js';

export const insertSpreadsheetSchema = createInsertSchema(spreadsheets, {
  id: z.string().trim().length(ID_LENGTH).optional().default(nanoid(ID_LENGTH)),
  key: ({ key }) => key.trim().length(ID_LENGTH),
  name: ({ name }) => name.trim().min(1),
  ownerId: ({ ownerId }) => ownerId.trim().length(ID_LENGTH),
});

export type Spreadsheet = typeof spreadsheets.$inferSelect;
export type InsertSpreadsheet = Omit<
  z.infer<typeof insertSpreadsheetSchema>,
  'id' | 'createdAt'
>;
