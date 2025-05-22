import { type CoreMessage, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { StreamData } from "ai";
import { googleTaskSchema } from "@/lib/schema";
import { getOAuth2ClientForUser } from "@/lib/integrations/google/getOauth";
import { insertGoogleTask } from "@/lib/integrations/google/insertTask";
import { format } from "date-fns";

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

  const { messages }: { messages: CoreMessage[] } = await req.json();

  const currentDate = new Date();
  const rfc3339Date = currentDate.toISOString();
  const readableDate = format(currentDate, "EEEE, MMMM d, yyyy");
  const dateOnly = format(currentDate, "yyyy-MM-dd");

  try {
    // Stream the AI response focused only on task creation
    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: `You are Vike AI, an efficient task creation assistant. Your sole purpose is to interpret user requests and create appropriate Google Tasks.

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
`,
      messages,
      tools: {
        createGoogleTask: tool({
          description: `Create a Google Task for the user.`,
          parameters: googleTaskSchema,
          execute: async ({ title, notes, due }) => {
            try {
              const oauth2Client = await getOAuth2ClientForUser(user.id!);
              const result = await insertGoogleTask(oauth2Client, {
                title,
                notes: notes || "",
                due,
              });

              return `✅ Task "${
                result.title
              }" created successfully with due date: ${
                result.due ?? "no due date"
              }.`;
            } catch {
              return `❌ Failed to create task`;
            }
          },
        }),
      },
      onFinish: async (completion) => {
        try {
          if (completion.toolResults) {
            data.append(completion.toolResults[0].result);
          }
        } finally {
          await data.close();
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "text/plain",
      },
      data,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Task creation process failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}