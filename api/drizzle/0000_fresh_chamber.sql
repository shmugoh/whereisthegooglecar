CREATE TABLE IF NOT EXISTS "channel" (
	"id" bigint PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"company" varchar DEFAULT 'google' NOT NULL,
	CONSTRAINT "channel_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spottings" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"town" varchar NOT NULL,
	"country" varchar NOT NULL,
	"countryEmoji" varchar NOT NULL,
	"imageUrl" varchar NOT NULL,
	"sourceUrl" varchar NOT NULL,
	"locationUrl" varchar,
	"company" varchar DEFAULT 'google' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"message_id" varchar NOT NULL,
	"channel_id" bigint NOT NULL,
	"width" integer,
	"height" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"town" varchar NOT NULL,
	"country" varchar NOT NULL,
	"imageUrl" varchar,
	"sourceUrl" varchar NOT NULL,
	"locationUrl" varchar,
	"company" varchar DEFAULT 'google' NOT NULL,
	"mode" varchar NOT NULL,
	"message_id" bigint NOT NULL,
	"output_message_id" bigint,
	"output_channel_id" bigint
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spottings_id_index" ON "spottings" USING btree ("id");