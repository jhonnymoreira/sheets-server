CREATE TABLE IF NOT EXISTS "contacts_count_by_spreadsheets" (
	"spreadsheet_id" varchar(21) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "contacts_count_by_spreadsheets_spreadsheet_id_index" ON "contacts_count_by_spreadsheets" ("spreadsheet_id");
DO $$ BEGIN
 ALTER TABLE "contacts_count_by_spreadsheets" ADD CONSTRAINT "contacts_count_by_spreadsheets_spreadsheet_id_spreadsheets_id_fk" FOREIGN KEY ("spreadsheet_id") REFERENCES "spreadsheets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "contacts" ADD CONSTRAINT "contacts_email_first_name_last_name_spreadsheet_id_unique" UNIQUE("email","first_name","last_name","spreadsheet_id");