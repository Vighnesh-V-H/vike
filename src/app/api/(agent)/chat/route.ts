import {
  type UIMessage,
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  generateText,
} from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { db } from "@/db";
import { chatHistory, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
  addToLeadSchema,
  deleteLeadsSchema,
  displayLeadsSchema,
} from "@/lib/schema";
import axios from "axios";

function extractTextFromParts(parts: any[]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

async function generateChatTitle(userMessage: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Generate a short, concise title (3-6 words maximum) for a chat conversation that starts with this message: "${userMessage}"

Rules:
- Maximum 6 words
- Capture the main topic or intent
- No punctuation at the end
- Be specific and descriptive
- Use title case

Examples:
"How do I import leads from Google Sheets?" -> "Import Leads from Sheets"
"What are the features of this app?" -> "App Features Overview"
"Can you help me with sales tracking?" -> "Sales Tracking Assistance"

Generate only the title, nothing else.`,
    });

    return text.trim().substring(0, 60) || "New Chat";
  } catch (error) {
    console.error("Error generating chat title:", error);
    return userMessage.substring(0, 60) || "New Chat";
  }
}

export async function POST(req: Request) {
  const session = await auth();

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

  let { messages: uiMessages, id }: { messages: UIMessage[]; id?: string } =
    await req.json();

  const validMessages = uiMessages.filter((msg) => {
    const parts = msg.parts || [];
    if (parts.length === 0) {
      return false;
    }
    return parts.some(
      (part) => part.type === "text" && part.text.trim().length > 0
    );
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

  const lastValidMessage = validMessages[validMessages.length - 1];
  const userMessageText = extractTextFromParts(lastValidMessage.parts || []);

  try {
    if (!currentChatId) {
      const title = await generateChatTitle(userMessageText);
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
      const title = await generateChatTitle(userMessageText);

      await db.insert(chatHistory).values({
        id: currentChatId,
        userId: session.user.id,
        title,
      });
    }

    if (lastValidMessage && lastValidMessage.role === "user") {
      await db.insert(chatMessages).values({
        chatId: currentChatId,
        role: lastValidMessage.role,
        content: userMessageText,
      });
    }

    const systemPrompt = `You are Vike AI, a knowledgeable assistant for personal knowledge management.
Maintain natural conversation flow and markdown formatting.

Guidelines:
1. Be concise but thorough
2. Use markdown for formatting
3. If unsure, say: There's no clear data about this topic
4. Focus on user's own knowledge base

IMPORTANT: When a user asks to import, add, or load data from a Google Sheet into leads, you MUST use the addToLead tool. Look for these keywords and phrases:
- "add from sheet"
- "import from sheet" 
- "load sheet data"
- "add sheet contents"
- "import leads from"
- "add all contents from sheet"
- Any mention of adding/importing Google Sheet data to leads

When you detect such requests:
1. Extract the sheet name from the user's message
2. Use the addToLead tool immediately with the sheet name
3. Do not ask for confirmation - execute the tool directly

2.  **Displaying Leads**: When a user asks to see, show, find, or list leads, you MUST use the \`displayLeads\` tool. This tool can filter by criteria like status, priority, source, etc.
    - User: "Show me all high priority leads" -> Action: Call displayLeads with priority="high"
    - User: "List the new leads" -> Action: Call displayLeads with status="new"
3. ** Deleting Leads**: When a user asks to delete, remove, get rid of, discard, or erase leads, you MUST use the deleteLeads tool. This can be for a single lead (by name/email) or in bulk (by criteria like status). Crucially, you must ask for explicit confirmation from the user before executing ANY deletion.

Single Deletion Example:

User: "Please remove the lead 'Jane Smith'."

Action: First, respond with "Are you sure you want to delete the lead for Jane Smith?". If the user confirms, then call deleteLeads with identifier="Jane Smith".

Bulk Deletion Example:

User: "Remove all leads that we lost."

Action: First, respond with "Are you sure you want to delete all 'lost' leads?".
** If the user confirms, then call deleteLeads tool with status="lost".**

    Examples:
- User: "Add all contents from my Sales Prospects sheet to leads"
- Action: Call addToLead tool with sheetName="Sales Prospects"

- User: "Can you import the data from my Client List sheet?"  
- Action: Call addToLead tool with sheetName="Client List"

After using a tool, provide a helpful response that acknowledges the action taken and its results.
`;

    const result = streamText({
      model: google("gemini-2.5-flash-lite-preview-09-2025"),
      system: systemPrompt,
      messages: convertToModelMessages(validMessages),
      stopWhen: stepCountIs(5),
      tools: {
        addToLead: tool({
          description: `Import leads from a Google Sheet into the user's lead database. Use this tool when the user asks to import, add, or load data from a Google Sheet into their leads.`,
          inputSchema: addToLeadSchema,
          execute: async ({ sheetName }) => {
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
              const errorMessage =
                error.response?.data?.error || error.message || "Unknown error";
              return `❌ Failed to import leads from sheet "${sheetName}". Error: ${errorMessage}`;
            }
          },
        }),

        displayLeads: tool({
          description:
            "Fetches and displays leads based on optional filter criteria.",
          inputSchema: displayLeadsSchema,
          execute: async (filters) => {
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
              const errorMessage =
                error.response?.data?.error || error.message || "Unknown error";
              return `❌ Failed to display leads. Error: ${errorMessage}`;
            }
          },
        }),

        deleteLeads: tool({
          description:
            "Deletes one or more leads based on an identifier or filter criteria.",
          inputSchema: deleteLeadsSchema,
          execute: async (filters) => {
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
              const errorMessage =
                error.response?.data?.error || error.message || "Unknown error";
              return `❌ Failed to execute deletion. Error: ${errorMessage}`;
            }
          },
        }),
      },
      onFinish: async ({ text, toolResults, finishReason, usage }) => {
        try {
          const cleanContent = text
            .replace(/<context>[\s\S]*?<\/context>/g, "")
            .trim();

          if (currentChatId && cleanContent) {
            await db.insert(chatMessages).values({
              chatId: currentChatId,
              role: "assistant",
              content: cleanContent,
            });
          }
        } catch (error) {
          console.error("Error in onFinish:", error);
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Chat-ID": currentChatId || "",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
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
