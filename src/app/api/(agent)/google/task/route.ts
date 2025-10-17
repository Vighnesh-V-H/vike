import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { googleTaskSchema } from "@/lib/schema";
import { getOAuth2ClientForUser } from "@/lib/integrations/google/getOauth";
import { insertGoogleTask } from "@/lib/integrations/google/insertTask";
import { format } from "date-fns";
import { z } from "zod";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthenticated" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const userId = session.user.id;

  const { messages } : { messages: any[] } = await req.json();

  const now = new Date();
  const rfc3339Date = now.toISOString();
  const readableDate = format(now, "EEEE, MMMM d, yyyy");
  const dateOnly = format(now, "yyyy-MM-dd");

  try {
    const result =  streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: `You are Vike AI, an efficient task creation assistant. Your sole purpose is to interpret user requests and create appropriate Google Tasks.

CURRENT DATE INFORMATION:
- Current Date (RFC3339): ${rfc3339Date}
- Current Date (Human-readable): ${readableDate}
- Date Only: ${dateOnly}

Task Management:
- Use the createGoogleTask tool to create tasks based on the user's request
- Convert relative dates like "tomorrow" or "next week" to proper RFC3339 format based on the current date above
- For "tomorrow", add 1 day to the current date
- For "next week", add 7 days to the current date
- For "this weekend", calculate the upcoming Saturday from current date
`
        },
        ...messages
      ],
      tools: {
        createGoogleTask: tool({
          description: "Create a Google Task for the user.",
          inputSchema: googleTaskSchema,
          execute: async (params:z.infer<typeof googleTaskSchema>) => {
            try {
              const oauth2Client = await getOAuth2ClientForUser(userId);
              const inserted = await insertGoogleTask(oauth2Client, {
                title:params.title,
                notes:params.notes,
                due:params.due,
              });
              return {
                success: true,
                message: `✅ Task "${inserted.title}" created successfully with due date: ${inserted.due ?? "none"}`,
              };
            } catch (err) {
              console.error("Error in createGoogleTask:", err);
              return { success: false, message: `❌ Failed to create task` };
            }
          },
        }),
      }
    });


    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("Task-creation POST error:", err);
    return new Response(
      JSON.stringify({ error: "Task creation process failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
