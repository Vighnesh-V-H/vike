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
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";
import { relations } from "drizzle-orm";

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