import {
  pgTable,
  serial,
  varchar,
  decimal,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "yearly"]);
export const statusEnum = pgEnum("status", ["active", "cancelled", "paused"]);

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  name: varchar("name", { length: 255 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  billingCycle: billingCycleEnum("billing_cycle").notNull().default("monthly"),
  nextBillingDate: date("next_billing_date").notNull(),
  category: varchar("category", { length: 100 }),
  status: statusEnum("status").notNull().default("active"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
