DO $$ BEGIN
 CREATE TYPE "spreadsheet_status" AS ENUM('to_process', 'to_review', 'processing', 'processed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "contacts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"spreadsheet_id" varchar(21) NOT NULL
);

CREATE TABLE IF NOT EXISTS "spreadsheets" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"key" varchar(21) NOT NULL,
	"status" "spreadsheet_status" DEFAULT 'to_process' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_id" varchar(21) NOT NULL,
	CONSTRAINT "spreadsheets_key_unique" UNIQUE("key")
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"github_handler" varchar(39) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_github_handler_unique" UNIQUE("github_handler")
);

CREATE INDEX IF NOT EXISTS "contacts_spreadsheet_id_idx" ON "contacts" ("spreadsheet_id");
CREATE INDEX IF NOT EXISTS "spreadsheets_owner_id_idx" ON "spreadsheets" ("owner_id");
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_spreadsheet_id_spreadsheets_id_fk" FOREIGN KEY ("spreadsheet_id") REFERENCES "spreadsheets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "spreadsheets" ADD CONSTRAINT "spreadsheets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
