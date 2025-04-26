CREATE TABLE "change_email_token" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "change_email_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "password_reset_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "change_email_token_email_token_index" ON "change_email_token" USING btree ("email","token");--> statement-breakpoint
CREATE INDEX "expires_idx" ON "change_email_token" USING btree ("expires");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_email_token_index" ON "password_reset_token" USING btree ("email","token");