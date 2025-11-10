CREATE TYPE "public"."email_notification_type" AS ENUM('renewal_reminder', 'price_change', 'past_due');--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"subscription_id" integer NOT NULL,
	"type" "email_notification_type" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
