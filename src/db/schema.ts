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
  password: text("password"),
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

export const documents = pgTable(
  "documents",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: varchar("uuid", { length: 36 })
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),

    // Source tracking
    sourceType: varchar("source_type").notNull(), // Removed FK
    sourceId: varchar("source_id", { length: 255 }).notNull(),

    // Universal document properties
    title: text("title").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    content: text("content").notNull(),

    processingStatus: varchar("processing_status", { length: 50 })
      .notNull()
      .default("pending"),
    isSuccessfullyProcessed: boolean("is_successfully_processed").default(
      false
    ),
    errorMessage: text("error_message"),

    // User association
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    contentHash: text("content_hash"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),

    description: text("description"),
    metadata: jsonb("metadata"),
  },
  (table) => [
    uniqueIndex("document_id_idx").on(table.id),
    uniqueIndex("document_uuid_idx").on(table.uuid),
    index("document_source_id_idx").on(table.sourceId),
    uniqueIndex("document_user_source_idx").on(
      table.userId,
      table.sourceType,
      table.sourceId
    ),
    index("document_source_type_idx").on(table.sourceType),
    index("document_status_idx").on(table.processingStatus),
    index("documents_search_idx").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', coalesce(${table.content}, '')),'A') ||
        setweight(to_tsvector('english', coalesce(${table.title}, '')),'B') ||
        setweight(to_tsvector('english', coalesce(${table.fileName}, '')),'C')
      )`
    ),
  ]
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

    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    status: varchar("status", { length: 50 }).notNull().default("pending"),
    error: text("error"),

    progress: integer("progress").default(0),
    totalChunks: integer("total_chunks"),
    processedChunks: integer("processed_chunks").default(0),

    sourceType: varchar("source_type", { length: 50 }).notNull(), // Removed FK
    priority: integer("priority").default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    docIdx: index("embedding_job_document_id_idx").on(table.documentId),
    userIdx: index("embedding_job_user_id_idx").on(table.userId),
    statusIdx: index("embedding_job_status_idx").on(table.status),
    sourceTypeIdx: index("embedding_job_source_type_idx").on(table.sourceType),
    priorityStatusIdx: index("embedding_job_priority_status_idx").on(
      table.priority,
      table.status,
      table.createdAt
    ),
  })
);

export type Document = typeof documents.$inferInsert;

export const emails = pgTable(
  "emails",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    messageId: text("message_id").notNull(),
    threadId: text("thread_id"),
    from: text("from").notNull(),
    to: text("to").notNull(),
    subject: text("subject"),
    body: text("body"),
    snippet: text("snippet"),
    read: boolean("read").default(false).notNull(),
    starred: boolean("starred").default(false).notNull(),
    categoryId: text("category_id").references(() => emailCategories.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    receivedAt: timestamp("received_at"),
    labels: jsonb("labels"),
    attachments: jsonb("attachments"),
    isArchived: boolean("is_archived").default(false).notNull(),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    index("thread_id_idx").on(table.threadId),
    index("message_id_idx").on(table.messageId),
    index("category_id_idx").on(table.categoryId),
  ]
);

export const emailCategories = pgTable(
  "email_categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").default("#4285F4").notNull(),
    icon: text("icon").default("inbox"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_category_name_idx").on(table.userId, table.name),
    index("user_id_idx").on(table.userId),
  ]
);

export const emailWorkflows = pgTable(
  "email_workflows",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    triggerConditions: jsonb("trigger_conditions").notNull(),
    actions: jsonb("actions").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
  ]
);

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    variables: jsonb("variables"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_template_name_idx").on(table.userId, table.name),
    index("user_id_idx").on(table.userId),
  ]
);

export const emailDigestSettings = pgTable(
  "email_digest_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    frequency: text("frequency").$type<"daily" | "weekly" | "monthly">().notNull(),
    categories: jsonb("categories"),
    timeOfDay: text("time_of_day"),
    dayOfWeek: integer("day_of_week"),
    dayOfMonth: integer("day_of_month"),
    lastSent: timestamp("last_sent"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_digest_name_idx").on(table.userId, table.name),
    index("user_id_idx").on(table.userId),
  ]
);

export const emailRelations = relations(emails, ({ one }) => ({
  user: one(users, {
    fields: [emails.userId],
    references: [users.id],
  }),
  category: one(emailCategories, {
    fields: [emails.categoryId],
    references: [emailCategories.id],
  }),
}));

export const emailCategoriesRelations = relations(emailCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [emailCategories.userId],
    references: [users.id],
  }),
  emails: many(emails),
}));

export const emailWorkflowsRelations = relations(emailWorkflows, ({ one }) => ({
  user: one(users, {
    fields: [emailWorkflows.userId],
    references: [users.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  user: one(users, {
    fields: [emailTemplates.userId],
    references: [users.id],
  }),
}));

export const emailDigestSettingsRelations = relations(emailDigestSettings, ({ one }) => ({
  user: one(users, {
    fields: [emailDigestSettings.userId],
    references: [users.id],
  }),
}));