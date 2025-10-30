ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_chat_id_chat_history_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chat_history_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat_history"("id") ON DELETE cascade ON UPDATE no action;