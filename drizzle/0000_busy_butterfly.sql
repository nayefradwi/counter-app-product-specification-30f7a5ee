CREATE TABLE IF NOT EXISTS "counters" (
	"id" varchar(64) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"value" integer DEFAULT 0 NOT NULL
);
