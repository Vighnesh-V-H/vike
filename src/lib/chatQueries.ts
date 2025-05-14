import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db"; // adjust path
import { chatHistory, chatMessages } from "@/db/schema";
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

export async function getChatHistoryWithMessages(userId: string) {
  try {
    // Fetch all sessions for the user
    const sessions = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(desc(chatHistory.createdAt));

    const results = await Promise.all(
      sessions.map(async (session) => {
        const messages = await db
          .select({
            content: chatMessages.content,
            role: chatMessages.role,
            createdAt: chatMessages.createdAt,
          })
          .from(chatMessages)
          .where(eq(chatMessages.chatId, session.id))
          .orderBy(asc(chatMessages.createdAt));

        return {
          ...session,
          messages,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Error fetching chat history with messages", error);
    throw error;
  }
}
