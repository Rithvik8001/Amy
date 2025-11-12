ALTER TYPE "public"."email_notification_type" ADD VALUE 'budget_approaching';--> statement-breakpoint
ALTER TYPE "public"."email_notification_type" ADD VALUE 'budget_exceeded';--> statement-breakpoint
ALTER TYPE "public"."email_notification_type" ADD VALUE 'budget_projected_exceed';--> statement-breakpoint
ALTER TABLE "email_notifications" ALTER COLUMN "subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "monthly_budget" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "yearly_budget" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "budget_alert_threshold" numeric(5, 2) DEFAULT '80.00';