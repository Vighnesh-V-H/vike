CREATE TABLE "chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"text_content" text NOT NULL,
	"order_in_document" integer NOT NULL,
	"embeddings" vector(768),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_source_types" (
	"type" varchar(50) PRIMARY KEY NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"content" text,
	"content_size" integer,
	"processing_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"is_successfully_processed" boolean DEFAULT false,
	"error_message" text,
	"user_id" text NOT NULL,
	"content_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone,
	"description" text,
	"metadata" jsonb,
	CONSTRAINT "documents_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "embedding_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error" text,
	"progress" integer DEFAULT 0,
	"total_chunks" integer,
	"processed_chunks" integer DEFAULT 0,
	"source_type" varchar(50) NOT NULL,
	"priority" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
DROP INDEX "change_email_token_email_token_index";--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sources" ADD CONSTRAINT "document_sources_source_type_document_source_types_type_fk" FOREIGN KEY ("source_type") REFERENCES "public"."document_source_types"("type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_source_type_document_source_types_type_fk" FOREIGN KEY ("source_type") REFERENCES "public"."document_source_types"("type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedding_jobs" ADD CONSTRAINT "embedding_jobs_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedding_jobs" ADD CONSTRAINT "embedding_jobs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedding_jobs" ADD CONSTRAINT "embedding_jobs_source_type_document_source_types_type_fk" FOREIGN KEY ("source_type") REFERENCES "public"."document_source_types"("type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chunk_id_idx" ON "chunks" USING btree ("id");--> statement-breakpoint
CREATE INDEX "chunk_document_id_idx" ON "chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "chunk_order_idx" ON "chunks" USING btree ("document_id","order_in_document");--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "chunks" USING hnsw ("embeddings" vector_cosine_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "document_id_idx" ON "documents" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_uuid_idx" ON "documents" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "document_source_id_idx" ON "documents" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_user_source_idx" ON "documents" USING btree ("user_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "document_source_type_idx" ON "documents" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "document_status_idx" ON "documents" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "documents_search_idx" ON "documents" USING gin ((
        setweight(to_tsvector('english', coalesce("content", '')),'A') ||
        setweight(to_tsvector('english', coalesce("title", '')),'B') ||
        setweight(to_tsvector('english', coalesce("file_name", '')),'C')
      ));--> statement-breakpoint
CREATE INDEX "embedding_job_document_id_idx" ON "embedding_jobs" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "embedding_job_user_id_idx" ON "embedding_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "embedding_job_status_idx" ON "embedding_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "embedding_job_source_type_idx" ON "embedding_jobs" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "embedding_job_priority_status_idx" ON "embedding_jobs" USING btree ("priority","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "emailTokenUnique" ON "change_email_token" USING btree ("email","token");