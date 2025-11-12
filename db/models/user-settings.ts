import {
  pgTable,
  serial,
  varchar,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const userSettings = pgTable(
  "user_settings",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
    currency: varchar("currency", { length: 3 }).notNull().default("USD"), // ISO currency code
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdUnique: unique("user_settings_user_id_unique").on(table.userId),
  })
);

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
