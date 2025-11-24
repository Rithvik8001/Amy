CREATE TABLE "ai_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"endpoint" varchar(50) NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"input_length" integer
);
--> statement-breakpoint
CREATE INDEX "ai_requests_user_id_idx" ON "ai_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_requests_requested_at_idx" ON "ai_requests" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "ai_requests_rate_limit_idx" ON "ai_requests" USING btree ("user_id","requested_at");