import { eq } from "drizzle-orm";
import { db } from "@/db"; // adjust path
import { chatMessages } from "@/db/schema";
import { auth } from "@/auth"; // your session handler

export async function getMessagesById(chatId: string) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(chatMessages.createdAt);

    return messages;
  } catch (error) {
    console.error("Failed to fetch messages from database", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
