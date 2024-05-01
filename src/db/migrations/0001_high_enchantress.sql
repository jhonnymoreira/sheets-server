ALTER TABLE "users" DROP CONSTRAINT "users_github_handler_unique";
ALTER TABLE "contacts" ALTER COLUMN "email" SET DATA TYPE varchar(256);
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(256);
ALTER TABLE "spreadsheets" DROP COLUMN IF EXISTS "status";
ALTER TABLE "users" DROP COLUMN IF EXISTS "github_handler";