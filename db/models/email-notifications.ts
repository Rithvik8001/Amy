import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const emailNotificationTypeEnum = pgEnum("email_notification_type", [
  "renewal_reminder",
  "renewal_reminder_1day",
  "price_change",
  "past_due",
]);

export const emailNotifications = pgTable(
  "email_notifications",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
    subscriptionId: integer("subscription_id").notNull(),
    type: emailNotificationTypeEnum("type").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    userIdIdx: index("email_notifications_user_id_idx").on(table.userId),
    subscriptionIdIdx: index("email_notifications_subscription_id_idx").on(
      table.subscriptionId
    ),
    typeIdx: index("email_notifications_type_idx").on(table.type),
    sentAtIdx: index("email_notifications_sent_at_idx").on(table.sentAt),
    // Composite index for duplicate checking
    duplicateCheckIdx: index("email_notifications_duplicate_check_idx").on(
      table.userId,
      table.subscriptionId,
      table.type,
      table.sentAt
    ),
  })
);

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type NewEmailNotification = typeof emailNotifications.$inferInsert;
