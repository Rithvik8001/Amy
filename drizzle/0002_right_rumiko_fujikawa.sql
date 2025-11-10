CREATE INDEX "email_notifications_user_id_idx" ON "email_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_notifications_subscription_id_idx" ON "email_notifications" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "email_notifications_type_idx" ON "email_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "email_notifications_sent_at_idx" ON "email_notifications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "email_notifications_duplicate_check_idx" ON "email_notifications" USING btree ("user_id","subscription_id","type","sent_at");