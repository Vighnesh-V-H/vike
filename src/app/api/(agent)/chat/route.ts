import { type CoreMessage, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { db } from "@/db";
import { chatHistory, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || !session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, id }: { messages: CoreMessage[]; id?: string } =
    await req.json();

  let currentChatId = id;

  // If no ID provided, create a new chat history
  if (!currentChatId) {
    const title =
      String(messages[messages.length - 1]?.content).substring(0, 100) ||
      "New chat";

    const [newChat] = await db
      .insert(chatHistory)
      .values({
        userId: session.user.id,
        title,
      })
      .returning({ id: chatHistory.id });

    currentChatId = newChat.id;
  } else {
    // Check if chat with this ID exists, if not create it
    const existingChat = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.id, currentChatId!))
      .limit(1);

    if (!existingChat.length) {
      const title =
        String(messages[messages.length - 1]?.content).substring(0, 100) ||
        "New chat";

      await db.insert(chatHistory).values({
        id: currentChatId,
        userId: session.user.id,
        title,
      });
    }
  }

  // Store the user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === "user") {
    await db.insert(chatMessages).values({
      chatId: currentChatId,
      role: lastMessage.role,
      content: String(lastMessage.content),
    });
  }

  // Create the stream with the AI response
  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: "You are a helpful assistant. answer the question",
    messages,
    onFinish: async (message) => {
      // @ts-expect-error
      const assistantResponse = message.response.messages[0].content[0].text;

      await db.insert(chatMessages).values({
        chatId: currentChatId,
        role: "assistant",
        content: assistantResponse,
      });
    },
  });

  // Get the original stream response
  const originalResponse = result.toDataStreamResponse();

  // Clone the response but add the chatId header
  return new Response(originalResponse.body, {
    headers: {
      ...Object.fromEntries(originalResponse.headers.entries()),
      "X-Chat-ID": currentChatId || "",
    },
    status: originalResponse.status,
    statusText: originalResponse.statusText,
  });
}
