ALTER TABLE "chat_sessions" RENAME TO "chat_history";--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_chat_id_chat_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_history" DROP CONSTRAINT "chat_sessions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chat_history_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat_history"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;