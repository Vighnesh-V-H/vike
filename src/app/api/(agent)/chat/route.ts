import { type CoreMessage, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { db } from "@/db";
// import { chatHistory, chatMessages, documents, chunk } from "@/db/schema";
import { chatHistory, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { createEmbedding } from "@/lib/embedding";
import { StreamData } from "ai";
import {
  addToLeadSchema,
  deleteLeadsSchema,
  displayLeadsSchema,
} from "@/lib/schema";
import axios from "axios";

export async function POST(req: Request) {
  const session = await auth();
  const data = new StreamData();

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const user = session.user;

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, id }: { messages: CoreMessage[]; id?: string } =
    await req.json();

  const validMessages = messages.filter((msg) => {
    const content = msg.content;
    if (typeof content === "string") {
      return content.trim().length > 0;
    }
    if (Array.isArray(content)) {
      return (
        content.length > 0 &&
        content.some(
          (part) =>
            (part.type === "text" && part.text.trim().length > 0) ||
            part.type === "image"
        )
      );
    }
    return false;
  });

  if (validMessages.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid messages provided" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let currentChatId = id;

  const userMessage = validMessages[validMessages.length - 1]?.content;

  // const matchingChunks: {
  //   documentTitle: string;
  //   documentUrl?: string;
  //   similarity: number;
  //   text: string;
  // }[] = [];

  try {
    if (!currentChatId) {
      const title = String(userMessage).substring(0, 100) || "New chat";
      const [newChat] = await db
        .insert(chatHistory)
        .values({ userId: session.user.id, title })
        .returning({ id: chatHistory.id });
      currentChatId = newChat.id;
    }

    const existingChat = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.id, currentChatId!))
      .limit(1);

    if (!existingChat.length) {
      const title =
        String(validMessages[validMessages.length - 1]?.content).substring(
          0,
          100
        ) || "New chat";

      await db.insert(chatHistory).values({
        id: currentChatId,
        userId: session.user.id,
        title,
      });
    }

    const lastMessage = validMessages[validMessages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      await db.insert(chatMessages).values({
        chatId: currentChatId,
        role: lastMessage.role,
        content: String(lastMessage.content),
      });
    }

  // let context = "";
    // RAG context retrieval disabled temporarily.
    // if (typeof userMessage === "string") {
    //   const embedding = await createEmbedding(userMessage);
    //
    //   if (embedding) {
    //     const vectorSimilarity = sql<number>`
    // 1 - ( ${chunk.embeddings} <=> ${sql.raw(`'[${embedding.join(",")]}'`)}::vector
    // ) `;
    //
    //     matchingChunks = await db
    //       .select({
    //         text: chunk.textContent,
    //         similarity: vectorSimilarity,
    //         documentTitle: documents.title,
    //       })
    //       .from(chunk)
    //       .innerJoin(documents, eq(chunk.documentId, documents.id))
    //       .where(
    //         and(
    //           eq(documents.userId, session.user.id),
    //           sql`${vectorSimilarity} > 0.3`
    //         )
    //       )
    //       .orderBy(desc(vectorSimilarity))
    //       .limit(5);
    //   }
    // }

    // if (matchingChunks.length > 0) {
    //   context += matchingChunks[0].text;
    // }
    // console.log(context);

  const systemPrompt = `You are Vike AI, a knowledgeable assistant for personal knowledge management, lead tracking, and productivity. 
You help users manage their personal notes, documents, and especially leads for sales or business purposes. Leads are potential customers or contacts, typically including fields like fullName, email, phone, status (e.g., new, in progress, won, lost), priority (e.g., low, medium, high), source (e.g., website, referral), company, and notes. Data is often imported from Google Sheets where each row represents a lead with these columns.

Use the following context when relevant. Maintain natural conversation flow and markdown formatting.

(Document context temporarily disabled)

Guidelines:
1. Be concise but thorough
2. Never refer sources naturally when using context
3. Use markdown for formatting, such as bold for emphasis, lists for multiple items, and tables for structured data like lead lists
4. If unsure, say: There's no clear data about this topic in your knowledge base
5. Focus on user's own knowledge base and leads
6. Suggest best practices for lead management, like following up on high-priority leads or organizing by status
7. Only use tools when explicitly triggered by user intent; do not assume or overreach
8. For deletions, always require confirmation to avoid data loss; persist confirmation state if needed across messages

IMPORTANT: When a user asks to import, add, or load data from a Google Sheet into leads, you MUST use the addToLead tool. Look for these keywords and phrases:
- "add from sheet"
- "import from sheet" 
- "load sheet data"
- "add sheet contents"
- "import leads from"
- "add all contents from sheet"
- Any mention of adding/importing Google Sheet data to leads

When you detect such requests:
1. Extract the sheet name from the user's message (e.g., assume it's mentioned like "Sales Prospects" or "Client List")
2. Use the addToLead tool immediately with the sheet name
3. Do not ask for confirmation - execute the tool directly
4. If sheet name is unclear, ask for clarification before using the tool

2.  **Displaying Leads**: When a user asks to see, show, find, or list leads, you MUST use the \`displayLeads\` tool. This tool can filter by criteria like status, priority, source, etc.
    - User: "Show me all high priority leads" -> Action: Call displayLeads with priority="high"
    - User: "List the new leads" -> Action: Call displayLeads with status="new"
    - If no filters are specified, call without parameters to show all
    - Format results in a markdown table for better readability if multiple leads

3. ** Deleting Leads**: When a user asks to delete, remove, get rid of, discard, or erase leads, you MUST use the deleteLeads tool. This can be for a single lead (by name/email) or in bulk (by criteria like status). Crucially, you must ask for explicit confirmation from the user before executing ANY deletion. Track confirmation in conversation if needed.

Single Deletion Example:

User: "Please remove the lead 'Jane Smith'."

Action: First, respond with "Are you sure you want to delete the lead for Jane Smith? Reply with 'yes' to confirm.". If the user confirms in the next message, then call deleteLeads with identifier="Jane Smith".

Bulk Deletion Example:

User: "Remove all leads that we lost."

Action: First, respond with "Are you sure you want to delete all 'lost' leads? This action cannot be undone. Reply with 'yes' to confirm.".
** If the user confirms, then call deleteLeads tool with status="lost".**

    Examples:
- User: "Add all contents from my Sales Prospects sheet to leads"
- Action: Call addToLead tool with sheetName="Sales Prospects"

- User: "Can you import the data from my Client List sheet?"  
- Action: Call addToLead tool with sheetName="Client List"

After using a tool, provide a helpful response that acknowledges the action taken and its results. If successful, offer next steps like "Would you like to view the updated leads?".
`;

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: validMessages,
      tools: {
        addToLead: tool({
          description: `Import leads from a Google Sheet into the user's lead database. Use this tool when the user asks to import, add, or load data from a Google Sheet into their leads.`,
          parameters: addToLeadSchema,
          execute: async ({ sheetName }) => {
            data.append(
              JSON.stringify({
                tool_status: `Importing leads from "${sheetName}"...`,
              })
            );
            try {
              const response = await axios.post(
                `${
                  process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
                }/api/importLeads`,
                { sheetName },
                { headers: { Cookie: req.headers.get("cookie") || "" } }
              );

              const responseData = response.data;

              if (responseData.success) {
                let message = `✅ ${responseData.message}`;
                if (responseData.skipped > 0) {
                  message += ` (${responseData.skipped} leads were skipped due to validation errors)`;
                }
                return message;
              } else {
                return `❌ Failed to import leads from sheet "${sheetName}". Error: ${
                  responseData.error || "Unknown error"
                }`;
              }
            } catch (error: any) {
              console.error("Error in addToLead tool:", error);
              const errorMessage =
                error.response?.data?.error || error.message || "Unknown error";
              return `❌ Failed to import leads from sheet "${sheetName}". Error: ${errorMessage}`;
            } finally {
              data.append(
                JSON.stringify({
                  tool_status: `Import complete for "${sheetName}".`,
                })
              );
            }
          },
        }),

        displayLeads: tool({
          description:
            "Fetches and displays leads based on optional filter criteria.",
          parameters: displayLeadsSchema,
          execute: async (filters) => {
            data.append(
              JSON.stringify({ tool_status: `Searching for leads...` })
            );
            try {
              const response = await axios.get(
                `${
                  process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
                }/api/display-leads`,
                {
                  params: filters,
                  headers: { Cookie: req.headers.get("cookie") || "" },
                }
              );
              const responseData = response.data;

              if (responseData.success && responseData.foundCount > 0) {
                const leadsList = responseData.data
                  .map(
                    (lead: any) =>
                      `- **${lead.fullName}** (Status: ${lead.status}, Priority: ${lead.priority})`
                  )
                  .join("\n");
                return `Found ${responseData.foundCount} leads:\n${leadsList}`;
              } else if (
                responseData.success &&
                responseData.foundCount === 0
              ) {
                return "No leads found matching your criteria.";
              } else {
                return `❌ Failed to display leads. Error: ${
                  responseData.error || "Unknown error"
                }`;
              }
            } catch (error: any) {
              console.error("Error in displayLeads tool:", error);
              const errorMessage =
                error.response?.data?.error || error.message || "Unknown error";
              return `❌ Failed to display leads. Error: ${errorMessage}`;
            } finally {
              data.append(
                JSON.stringify({
                  tool_status: `Search complete.`,
                })
              );
            }
          },
        }),

        deleteLeads: tool({
          description:
            "Deletes one or more leads based on an identifier or filter criteria.",
          parameters: deleteLeadsSchema,
          execute: async (filters) => {
            data.append(
              JSON.stringify({ tool_status: `Attempting to delete leads...` })
            );
            try {
              const response = await axios.post(
                `${
                  process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
                }/api/delete-leads`,
                filters,
                {
                  headers: { Cookie: req.headers.get("cookie") || "" },
                }
              );
              const responseData = response.data;
              if (responseData.success) {
                return `✅ ${responseData.message}`;
              } else {
                return `❌ Failed to delete lead(s). Error: ${
                  responseData.error || "Unknown error"
                }`;
              }
            } catch (error: any) {
              console.error("Error in deleteLeads tool:", error);
              const errorMessage =
                error.response?.data?.error || error.message || "Unknown error";
              return `❌ Failed to execute deletion. Error: ${errorMessage}`;
            } finally {
              data.append(
                JSON.stringify({
                  tool_status: `Deletion attempt complete.`,
                })
              );
            }
          },
        }),
      },
      onFinish: async (completion) => {
        try {
          const cleanContent = completion.text.replace(
            /<context>[\s\S]*?<\/context>/g,
            ""
          );

          let finalContent = cleanContent;

          if (completion.toolResults && completion.toolResults.length > 0) {
            const toolResultsText = completion.toolResults
              .map((toolResult) => {
                if (
                  toolResult.result &&
                  typeof toolResult.result === "string"
                ) {
                  return toolResult.result;
                }
                return "";
              })
              .filter(Boolean)
              .join("\n\n");

            if (toolResultsText && !finalContent.includes(toolResultsText)) {
              if (!finalContent.trim()) {
                finalContent = toolResultsText;
              } else {
                finalContent = finalContent.trim() + "\n\n" + toolResultsText;
              }
            }
          }

          if (currentChatId && finalContent.trim()) {
           
            await db.insert(chatMessages).values({
              chatId: currentChatId,
              role: "assistant",
              content: finalContent,
            });
          }

          // if (context) {
          //   data.appendMessageAnnotation({
          //     context: matchingChunks.map((c) => ({
          //       document: c.documentTitle,
          //       url: c.documentUrl || "",
          //       similarity: Number(c.similarity.toFixed(3)),
          //     })),
          //   });
          // }
        } catch (error) {
          console.error("Error in onFinish:", error);
        } finally {
          data.close();
        }
      },
      onError: (error) => {
        console.error("Error during generation:", error);
        data.close();
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "X-Chat-ID": currentChatId,
        "Content-Type": "text/plain",
      },
      data,
    });
  } catch (error) {
    console.error("Error in chat processing:", error);
    data.close();
    return new Response(
      JSON.stringify({
        error: "Chat processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}