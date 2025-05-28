import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emails, emailDigestSettings } from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/genai";
import nodemailer from "nodemailer";
import { z } from "zod";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

const digestSchema = z.object({
  digestId: z.string().uuid().optional(),
  preview: z.boolean().optional().default(false),
  dateRange: z
    .object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = digestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 }
      );
    }

    const { digestId, preview, dateRange } = validation.data;

    // Get digest settings
    let digestSettings;

    if (digestId) {
      digestSettings = await db.query.emailDigestSettings.findFirst({
        where: (settings, { eq, and }) =>
          and(eq(settings.id, digestId), eq(settings.userId, session.user.id)),
      });

      if (!digestSettings) {
        return NextResponse.json(
          { error: "Digest settings not found" },
          { status: 404 }
        );
      }
    } else {
      // Use default digest settings if no specific digest is requested
      digestSettings = {
        id: "default",
        name: "Quick Digest",
        frequency: "daily" as const,
        categories: null,
        timeOfDay: "12:00",
        dayOfWeek: null,
        dayOfMonth: null,
        isActive: true,
      };
    }

    // Determine date range based on digest frequency
    let startDate = new Date();
    let endDate = new Date();

    if (dateRange) {
      if (dateRange.start) startDate = parseISO(dateRange.start);
      if (dateRange.end) endDate = parseISO(dateRange.end);
    } else {
      switch (digestSettings.frequency) {
        case "daily":
          startDate = startOfDay(subDays(new Date(), 1));
          break;
        case "weekly":
          startDate = startOfDay(subDays(new Date(), 7));
          break;
        case "monthly":
          startDate = startOfDay(subDays(new Date(), 30));
          break;
      }
    }

    // Query emails within the date range
    let emailQuery = db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.userId, session.user.id),
          gte(emails.receivedAt, startDate),
          lte(emails.receivedAt, endDate)
        )
      );

    // Filter by categories if specified
    if (digestSettings.categories) {
      const categories = JSON.parse(digestSettings.categories as string);
      if (Array.isArray(categories) && categories.length > 0) {
        emailQuery = emailQuery.where(inArray(emails.categoryId, categories));
      }
    }

    const emailsForDigest = await emailQuery.execute();

    if (emailsForDigest.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No emails found for digest in the specified time range",
      });
    }

    // Group emails by category
    const emailsByCategory: Record<string, any[]> = {};

    for (const email of emailsForDigest) {
      const categoryName = email.categoryId || "Uncategorized";
      if (!emailsByCategory[categoryName]) {
        emailsByCategory[categoryName] = [];
      }
      emailsByCategory[categoryName].push(email);
    }

    // Generate digest HTML
    const digestHTML = await generateDigestHTML(
      digestSettings.name,
      emailsByCategory,
      startDate,
      endDate
    );

    // If preview, just return the digest HTML
    if (preview) {
      return NextResponse.json({
        success: true,
        html: digestHTML,
        emailCount: emailsForDigest.length,
        categories: Object.keys(emailsByCategory).length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
    }

    // Otherwise, send the email
    const emailSent = await sendDigestEmail(
      session.user.email!,
      digestSettings.name,
      digestHTML
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send digest email" },
        { status: 500 }
      );
    }

    // Update last sent timestamp if this is a saved digest
    if (digestId) {
      await db
        .update(emailDigestSettings)
        .set({ lastSent: new Date() })
        .where(eq(emailDigestSettings.id, digestId))
        .execute();
    }

    return NextResponse.json({
      success: true,
      message: "Digest email sent successfully",
      emailCount: emailsForDigest.length,
      categories: Object.keys(emailsByCategory).length,
    });
  } catch (error) {
    console.error("Error generating email digest:", error);
    return NextResponse.json(
      { error: "Failed to generate email digest" },
      { status: 500 }
    );
  }
}

async function generateDigestHTML(
  digestName: string,
  emailsByCategory: Record<string, any[]>,
  startDate: Date,
  endDate: Date
): Promise<string> {
  const dateRange = `${format(startDate, "MMMM d, yyyy")} - ${format(
    endDate,
    "MMMM d, yyyy"
  )}`;

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${digestName}</h1>
      <p style="color: #666;">${dateRange}</p>
      
      <div style="margin-top: 20px;">
  `;

  for (const [categoryId, categoryEmails] of Object.entries(emailsByCategory)) {
    const categoryName = categoryId || "Uncategorized";
    const borderColor = getCategoryColor(categoryName);

    html += `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; color: #333; margin-bottom: 10px;">
          ${categoryName} (${categoryEmails.length} emails)
        </h2>
        <div>
    `;

    // Show up to 5 emails per category
    const displayEmails = categoryEmails.slice(0, 5);
    const remainingCount = Math.max(0, categoryEmails.length - 5);

    for (const email of displayEmails) {
      const date = email.receivedAt
        ? format(new Date(email.receivedAt), "MMM d, h:mm a")
        : "";

      html += `
        <div style="border-left: 3px solid ${borderColor}; padding: 8px 15px; margin-bottom: 10px; background-color: #f9f9f9;">
          <div style="font-weight: bold;">${email.subject || "No Subject"}</div>
          <div style="font-size: 12px; color: #666;">From: ${
            email.from
          } • ${date}</div>
          <div style="font-size: 14px; color: #333; margin-top: 5px;">${
            email.snippet || ""
          }</div>
        </div>
      `;
    }

    if (remainingCount > 0) {
      html += `
        <div style="font-size: 12px; color: #0066cc; margin-top: 5px;">
          + ${remainingCount} more emails
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  }

  html += `
      </div>
      
      <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <a href="#" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View All Emails</a>
      </div>
      
      <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
        This digest was automatically generated by Vike Email Intelligence.
      </div>
    </div>
  `;

  return html;
}

async function sendDigestEmail(
  toEmail: string,
  digestName: string,
  htmlContent: string
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Vike Email Intelligence" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: toEmail,
      subject: `${digestName} - ${format(new Date(), "MMMM d, yyyy")}`,
      html: htmlContent,
    });

    return !!info.messageId;
  } catch (error) {
    console.error("Error sending digest email:", error);
    return false;
  }
}

function getCategoryColor(categoryName: string): string {
  // Map of category names to colors
  const categoryColors: Record<string, string> = {
    Work: "#4285F4",
    Personal: "#FF5722",
    Finance: "#009688",
    Shopping: "#9C27B0",
    Travel: "#FFC107",
    Social: "#E91E63",
    Newsletters: "#FBBC05",
    Promotions: "#34A853",
    Updates: "#607D8B",
    Forums: "#795548",
    Meetings: "#3F51B5",
    Support: "#EA4335",
    Marketing: "#673AB7",
    Notifications: "#8BC34A",
    Bills: "#03A9F4",
    Uncategorized: "#9E9E9E",
  };

  return categoryColors[categoryName] || "#9E9E9E";
}
