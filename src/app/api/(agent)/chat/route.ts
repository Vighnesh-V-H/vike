import { type CoreMessage, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { db } from "@/db";
import { chatHistory, chatMessages, documents, chunk } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createEmbedding } from "@/lib/docProcessor";
import { StreamData } from "ai";

export async function POST(req: Request) {
  const session = await auth();
  const data = new StreamData();

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, id }: { messages: CoreMessage[]; id?: string } =
    await req.json();

  let currentChatId = id;

  const userMessage = messages[messages.length - 1]?.content;

  let matchingChunks: {
    documentTitle: string;
    documentUrl?: string;
    similarity: number;
    text: string;
  }[] = [];

  try {
    // Create or validate chat history
    if (!currentChatId) {
      const title = String(userMessage).substring(0, 100) || "New chat";
      const [newChat] = await db
        .insert(chatHistory)
        .values({ userId: session.user.id, title })
        .returning({ id: chatHistory.id });
      console.log("curr -r", currentChatId);
      currentChatId = newChat.id;
    }
    console.log(currentChatId);

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

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      await db.insert(chatMessages).values({
        chatId: currentChatId,
        role: lastMessage.role,
        content: String(lastMessage.content),
      });
    }

    // Semantic search pipeline
    let context = "";
    if (typeof userMessage === "string") {
      // Generate query embedding
      const embedding = await createEmbedding(userMessage);

      if (embedding) {
        // Vector similarity search
        const vectorSimilarity = sql<number>`
    1 - (
      ${chunk.embeddings} <=> 
      ${sql.raw(`'[${embedding.join(",")}]'`)}::vector
    )
  `;

        matchingChunks = await db
          .select({
            text: chunk.textContent,
            similarity: vectorSimilarity,
            documentTitle: documents.title,
          })
          .from(chunk)
          .innerJoin(documents, eq(chunk.documentId, documents.id))
          .where(
            and(
              eq(documents.userId, session.user.id),
              sql`${vectorSimilarity} > 0.3`
            )
          )
          .orderBy(desc(vectorSimilarity))
          .limit(5);
      }
    }

    context += matchingChunks[0].text;

    console.log(context);

    // System prompt with context
    const systemPrompt = `You are Vike AI, a knowledgeable assistant for personal knowledge management. 
Use the following context when relevant. Maintain natural conversation flow and markdown formatting.

${context ? `<context>\n${context}\n</context>` : ""}

Guidelines:
1. Be concise but thorough
2. Donot refer sources naturally when using context
3. Use markdown for formatting
4. If unsure, say :There's no clear data about this topic
5. Focus on user's own knowledge base`;

    // Stream the AI response
    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages,
      onFinish: async (completion) => {
        try {
          // Store cleaned response
          const cleanContent = completion.text.replace(
            /<context>[\s\S]*?<\/context>/g,
            ""
          );

          if (currentChatId) {
            await db.insert(chatMessages).values({
              chatId: currentChatId,
              role: "assistant",
              content: cleanContent,
            });
          }

          // Append context as annotation
          if (context) {
            data.appendMessageAnnotation({
              context: matchingChunks.map((c) => ({
                document: c.documentTitle,
                url: c.documentUrl || "",
                similarity: Number(c.similarity.toFixed(3)),
              })),
            });
          }
        } finally {
          await data.close();
        }
      },
    });

    // Return streaming response
    return result.toDataStreamResponse({
      headers: {
        "X-Chat-ID": currentChatId,
        "Content-Type": "text/plain",
      },
      data,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Chat processing failed" }), {
      status: 500,
    });
  }
}
