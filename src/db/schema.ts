import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const ID_LENGTH = 21;

export const contacts = pgTable(
  'contacts',
  {
    id: varchar('id', { length: ID_LENGTH })
      .primaryKey()
      .$defaultFn(() => nanoid(ID_LENGTH)),
    email: varchar('email', { length: 256 }).notNull(),
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
      uniq: unique().on(
        table.email,
        table.firstName,
        table.lastName,
        table.spreadsheetId
      ),
      contactsSpreadsheetIdIdex: index('contacts_spreadsheet_id_idx').on(
        table.spreadsheetId
      ),
    };
  }
);

export const spreadsheets = pgTable(
  'spreadsheets',
  {
    id: varchar('id', { length: ID_LENGTH })
      .primaryKey()
      .$defaultFn(() => nanoid(ID_LENGTH)),
    name: varchar('name', { length: 64 }).notNull(),
    key: varchar('key', { length: ID_LENGTH }).notNull().unique(),
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
  id: varchar('id', { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => nanoid(ID_LENGTH)),
  email: varchar('email', { length: 256 }).notNull().unique(),
  externalId: text('external_id').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contactsBySpreadsheetsCount = pgTable(
  'contacts_count_by_spreadsheets',
  {
    spreadsheetId: varchar('spreadsheet_id', { length: ID_LENGTH })
      .primaryKey()
      .$defaultFn(() => nanoid(ID_LENGTH))
      .references(() => spreadsheets.id),
    count: integer('count').notNull(),
  },
  (table) => {
    return {
      spreadsheetIdIdx: index().on(table.spreadsheetId),
    };
  }
);
