import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const ID_LENGTH = 21;

export const contacts = pgTable(
  'contacts',
  {
    id: varchar('id', { length: ID_LENGTH }).primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    spreadsheetId: varchar('spreadsheet_id', { length: ID_LENGTH })
      .notNull()
      .references(() => spreadsheets.id),
  },
  (table) => {
    return {
      contactsSpreadsheetIdIdex: index('contacts_spreadsheet_id_idx').on(
        table.spreadsheetId
      ),
    };
  }
);

export const spreadsheetStatusEnum = pgEnum('spreadsheet_status', [
  'to_process',
  'to_review',
  'processing',
  'processed',
]);

export const spreadsheets = pgTable(
  'spreadsheets',
  {
    id: varchar('id', { length: ID_LENGTH }).primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    key: varchar('key', { length: ID_LENGTH }).notNull().unique(),
    status: spreadsheetStatusEnum('status').notNull().default('to_process'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    ownerId: varchar('owner_id', { length: ID_LENGTH })
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      spreadsheetsOwnerIdIdx: index('spreadsheets_owner_id_idx').on(
        table.ownerId
      ),
    };
  }
);

export const users = pgTable('users', {
  id: varchar('id', { length: ID_LENGTH }).primaryKey(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  githubHandler: varchar('github_handler', { length: 39 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
