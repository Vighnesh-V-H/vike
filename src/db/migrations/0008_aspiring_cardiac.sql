CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"title" text,
	"description" text,
	"user_id" integer NOT NULL,
	"content" text,
	"metadata" jsonb
);
--> statement-breakpoint
DROP INDEX "change_email_token_email_token_index";--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_id_idx" ON "documents" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "emailTokenUnique" ON "change_email_token" USING btree ("email","token");