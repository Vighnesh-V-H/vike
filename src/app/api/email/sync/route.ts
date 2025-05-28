import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emails, emailCategories } from "@/db/schema";
import { google } from "googleapis";
import { categorizeEmail } from "@/lib/email/categorize";
import { z } from "zod";

const syncSchema = z.object({
  limit: z.number().optional().default(50),
  query: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 50);
    const query = searchParams.get("query") || "";

    const validation = syncSchema.safeParse({ limit, query });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 }
      );
    }

    // Get Google integration from database
    const googleIntegration = await db.query.integrations.findFirst({
      where: (integrations, { eq, and }) =>
        and(
          eq(integrations.userId, session.user.id),
          eq(integrations.type, "google"),
          eq(integrations.isActive, true)
        ),
    });

    if (!googleIntegration) {
      return NextResponse.json(
        { error: "Google integration not found" },
        { status: 404 }
      );
    }

    // Setup Google API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: googleIntegration.accessToken,
      refresh_token: googleIntegration.refreshToken,
    });

    // Gmail API
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get messages
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      q: query,
    });

    const messages = response.data.messages || [];

    // Process each message
    const processedEmails = [];

    for (const message of messages) {
      // Get full message details
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
      });

      const headers = fullMessage.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const to = headers.find((h) => h.name === "To")?.value || "";
      const date = new Date(Number(fullMessage.data.internalDate));

      // Get message body
      let body = "";
      if (fullMessage.data.payload?.body?.data) {
        body = Buffer.from(
          fullMessage.data.payload.body.data,
          "base64"
        ).toString();
      } else if (
        fullMessage.data.payload?.parts &&
        fullMessage.data.payload.parts.length > 0
      ) {
        const textPart = fullMessage.data.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString();
        }
      }

      // Get labels
      const labels = fullMessage.data.labelIds || [];

      // Categorize email using AI
      const category = await categorizeEmail(subject, body);

      // Find or create category
      let categoryId = null;
      if (category) {
        const existingCategory = await db.query.emailCategories.findFirst({
          where: (categories, { eq, and }) =>
            and(
              eq(categories.userId, session.user.id),
              eq(categories.name, category.name)
            ),
        });

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const [newCategory] = await db
            .insert(emailCategories)
            .values({
              userId: session.user.id,
              name: category.name,
              color: category.color || "#4285F4",
            })
            .returning();

          categoryId = newCategory.id;
        }
      }

      // Save email to database
      const [savedEmail] = await db
        .insert(emails)
        .values({
          userId: session.user.id,
          messageId: message.id!,
          threadId: fullMessage.data.threadId!,
          from,
          to,
          subject,
          body,
          snippet: fullMessage.data.snippet || "",
          read: !labels.includes("UNREAD"),
          starred: labels.includes("STARRED"),
          categoryId,
          receivedAt: date,
          labels: labels,
        })
        .returning();

      processedEmails.push(savedEmail);
    }

    return NextResponse.json({
      success: true,
      count: processedEmails.length,
      emails: processedEmails,
    });
  } catch (error) {
    console.error("Error syncing emails:", error);
    return NextResponse.json(
      { error: "Failed to sync emails" },
      { status: 500 }
    );
  }
}
