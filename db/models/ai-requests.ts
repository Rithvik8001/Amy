import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const aiRequests = pgTable(
  "ai_requests",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
    endpoint: varchar("endpoint", { length: 50 }).notNull(), // 'parse-subscription' | 'budget-recommendations'
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    inputLength: integer("input_length"), // Track input size for monitoring
  },
  (table) => ({
    userIdIdx: index("ai_requests_user_id_idx").on(table.userId),
    requestedAtIdx: index("ai_requests_requested_at_idx").on(table.requestedAt),
    // Composite index for efficient rate limit queries
    rateLimitIdx: index("ai_requests_rate_limit_idx").on(
      table.userId,
      table.requestedAt
    ),
  })
);

export type AIRequest = typeof aiRequests.$inferSelect;
export type NewAIRequest = typeof aiRequests.$inferInsert;
