import { auth } from "@/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { getOAuth2ClientForUser } from "@/lib/integrations/google/getOauth";
import {
  getSheetData,
  getSheets,
} from "@/lib/integrations/google/googleSheets";
import { leadSchema } from "@/lib/schema";
import { z } from "zod";

const requestSchema = z.object({
  sheetName: z.string().min(1, "Sheet name is required"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: "Invalid request", details: validation.error },
        { status: 400 }
      );
    }

    const { sheetName } = validation.data;

    const oauth2Client = await getOAuth2ClientForUser(userId);

    const sheets = await getSheets(oauth2Client);

    const sheet = sheets.find((s) => s.name === sheetName);
    if (!sheet) {
      return Response.json(
        { error: `Sheet "${sheetName}" not found` },
        { status: 404 }
      );
    }

    // Get the sheet data
    const sheetData = await getSheetData(
      oauth2Client,
      sheet.id || "",
      sheet.name || ""
    );

    if (!sheetData || sheetData.length < 2) {
      return Response.json(
        { error: `Sheet "${sheetName}" has insufficient data` },
        { status: 400 }
      );
    }

    const headers = sheetData[0].map((header) =>
      header?.toString().toLowerCase().trim()
    );

    // Function to get values by header name
    const getValueByHeader = (row: any[], headerName: string) => {
      const index = headers.findIndex(
        (h) =>
          h === headerName.toLowerCase() ||
          h.replace(/\s+/g, "") ===
            headerName.toLowerCase().replace(/\s+/g, "") ||
          h.includes(headerName.toLowerCase()) ||
          headerName.toLowerCase().includes(h)
      );
      return index !== -1 ? row[index]?.toString().trim() || "" : "";
    };

    const validatedLeads: z.infer<typeof leadSchema>[] = [];
    const invalidLeads: z.infer<typeof leadSchema>[] = [];

    // Process each data row (skip header row)
    sheetData.slice(1).forEach((row, index) => {
      const rawData = {
        fullName:
          getValueByHeader(row, "full name") ||
          getValueByHeader(row, "name") ||
          getValueByHeader(row, "fullname") ||
          "",
        email:
          getValueByHeader(row, "email") ||
          getValueByHeader(row, "email address"),
        phone:
          getValueByHeader(row, "phone") ||
          getValueByHeader(row, "phone number") ||
          getValueByHeader(row, "mobile") ||
          "",
        companyName:
          getValueByHeader(row, "company name") ||
          getValueByHeader(row, "company") ||
          getValueByHeader(row, "organization") ||
          "",
        jobTitle:
          getValueByHeader(row, "job title") ||
          getValueByHeader(row, "title") ||
          getValueByHeader(row, "position") ||
          "",
        source:
          getValueByHeader(row, "source") ||
          getValueByHeader(row, "lead source") ||
          "",
        tags: [
          getValueByHeader(row, "tags") || getValueByHeader(row, "tag") || "",
        ],
        status: getValueByHeader(row, "status") || "new",
        priority: getValueByHeader(row, "priority") || "medium",
        value:
          getValueByHeader(row, "value") ||
          getValueByHeader(row, "deal value") ||
          getValueByHeader(row, "amount") ||
          "",
        assignedTo:
          getValueByHeader(row, "assigned to") ||
          getValueByHeader(row, "assignee") ||
          getValueByHeader(row, "owner") ||
          "",
        notes:
          getValueByHeader(row, "notes") ||
          getValueByHeader(row, "comments") ||
          getValueByHeader(row, "remarks") ||
          "",
        position: index,
      };

      const validationResult = leadSchema.safeParse(rawData);
      if (validationResult.success) {
        validatedLeads.push(validationResult.data);
      } else {
        invalidLeads.push(rawData);
      }
    });

    if (validatedLeads.length === 0) {
      return Response.json(
        {
          error: "No valid leads found",
          details: `All ${invalidLeads.length} rows failed validation`,
        },
        { status: 400 }
      );
    }

    const leadsToInsert = validatedLeads.map((validatedData) => ({
      fullName: validatedData.fullName,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      companyName: validatedData.companyName || null,
      jobTitle: validatedData.jobTitle || null,
      source: `Google Sheet: ${sheetName}`,
      tags: Array.isArray(validatedData.tags)
        ? JSON.stringify(validatedData.tags)
        : null,
      status: validatedData.status,
      priority: validatedData.priority,
      value: validatedData.value ? String(validatedData.value) : null,
      assignedTo: validatedData.assignedTo || null,
      userId: userId,
      notes: validatedData.notes || null,
      position: validatedData.position,
    }));

    // Insert leads into the database
    const result = await db.insert(leads).values(leadsToInsert).returning();

    return Response.json({
      success: true,
      message: `Successfully imported ${result.length} leads from "${sheetName}"`,
      imported: result.length,
      skipped: invalidLeads.length,
    });
  } catch (error: any) {
    console.error("Error importing leads:", error);
    return Response.json(
      {
        error: "Failed to import leads",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
