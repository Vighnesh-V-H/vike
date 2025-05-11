import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  index,
  uniqueIndex,
  uuid,
  jsonb,
  vector,
  serial,
  varchar,
  bigserial,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";
import { relations, sql } from "drizzle-orm";

const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle";
const pool = postgres(connectionString, { max: 1 });

export const db = drizzle(pool);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const verificationTokens = pgTable("verificationToken", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export const passwordResetToken = pgTable(
  "password_reset_token",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (table) => {
    return {
      emailTokenUnique: uniqueIndex().on(table.email, table.token),
    };
  }
);

export const changeEmailToken = pgTable(
  "change_email_token",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("emailTokenUnique").on(table.email, table.token),
    index("expires_idx").on(table.expires),
  ]
);

export const chatHistory = pgTable("chat_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  chatId: text("chat_id")
    .notNull()
    .references(() => chatHistory.id),
  role: text("role")
    .$type<"data" | "system" | "user" | "assistant">()
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrations = pgTable(
  "integrations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    name: text("name"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    scope: text("scope"),
    tokenType: text("token_type"),
    data: jsonb("data"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_type_name_idx").on(table.userId, table.type, table.name),
    index("user_id_idx").on(table.userId),
    index("type_idx").on(table.type),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  integrations: many(integrations),
}));

export const documentSourceType = pgTable("document_source_types", {
  type: varchar("type", { length: 50 }).primaryKey(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentSources = pgTable("document_sources", {
  id: serial("id").primaryKey(),
  sourceType: varchar("source_type", { length: 50 })
    .references(() => documentSourceType.type)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // Store integration-specific configuration
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: bigserial("id", { mode: "number" }).notNull().primaryKey(),
    uuid: varchar("uuid", { length: 36 })
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),

    // Source tracking
    sourceType: varchar("source_type", { length: 50 })
      .references(() => documentSourceType.type)
      .notNull(),
    sourceId: varchar("source_id", { length: 255 }).notNull(), // External ID from the source system

    // Universal document properties
    title: text("title").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    content: text("content"), // Full document content
    contentSize: integer("content_size"), // Size in bytes

    // Processing status
    processingStatus: varchar("processing_status", { length: 50 })
      .notNull()
      .default("pending"), // pending, processing, completed, failed
    isSuccessfullyProcessed: boolean("is_successfully_processed").default(
      false
    ),
    errorMessage: text("error_message"),

    // User association
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Content hash for deduplication
    contentHash: text("content_hash"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),

    // Optional fields for additional metadata
    description: text("description"),
    metadata: jsonb("metadata"), // Flexible field for integration-specific metadata
  },
  (table) => ({
    documentsIdIdx: uniqueIndex("document_id_idx").on(table.id),
    documentsUuidIdx: uniqueIndex("document_uuid_idx").on(table.uuid),
    documentsSourceIdIdx: index("document_source_id_idx").on(table.sourceId),
    documentsUserSourceIdx: uniqueIndex("document_user_source_idx").on(
      table.userId,
      table.sourceType,
      table.sourceId
    ),
    documentsSourceTypeIdx: index("document_source_type_idx").on(
      table.sourceType
    ),
    documentsStatusIdx: index("document_status_idx").on(table.processingStatus),
    searchIndex: index("documents_search_idx").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', coalesce(${table.content}, '')),'A') ||
        setweight(to_tsvector('english', coalesce(${table.title}, '')),'B') ||
        setweight(to_tsvector('english', coalesce(${table.fileName}, '')),'C')
      )`
    ),
  })
);

export const chunk = pgTable(
  "chunks",
  {
    id: serial("id").primaryKey(),
    documentId: integer("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),

    textContent: text("text_content").notNull(),

    orderInDocument: integer("order_in_document").notNull(),

    embeddings: vector("embeddings", { dimensions: 768 }),

    metadata: jsonb("metadata").$type<{
      startChar?: number;
      endChar?: number;
      heading?: string;
      isHeading?: boolean;
      section?: string;
      pageNumber?: number;
      paragraphNumber?: number;
    }>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (chunk) => ({
    chunkIdIdx: uniqueIndex("chunk_id_idx").on(chunk.id),
    chunkDocumentIdIdx: index("chunk_document_id_idx").on(chunk.documentId),
    chunkOrderIdx: index("chunk_order_idx").on(
      chunk.documentId,
      chunk.orderInDocument
    ),
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      chunk.embeddings.op("vector_cosine_ops")
    ),
  })
);

export const embeddingJobs = pgTable(
  "embedding_jobs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Reference to document being processed
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Job status tracking
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
    error: text("error"),

    // Progress tracking
    progress: integer("progress").default(0), // 0-100 percentage
    totalChunks: integer("total_chunks"),
    processedChunks: integer("processed_chunks").default(0),

    // Job source and type info
    sourceType: varchar("source_type", { length: 50 })
      .references(() => documentSourceType.type)
      .notNull(),
    priority: integer("priority").default(1), // Higher number = higher priority

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => {
    return {
      docIdx: index("embedding_job_document_id_idx").on(table.documentId),
      userIdx: index("embedding_job_user_id_idx").on(table.userId),
      statusIdx: index("embedding_job_status_idx").on(table.status),
      sourceTypeIdx: index("embedding_job_source_type_idx").on(
        table.sourceType
      ),
      // Add index to help with job queue processing
      priorityStatusIdx: index("embedding_job_priority_status_idx").on(
        table.priority,
        table.status,
        table.createdAt
      ),
    };
  }
);
