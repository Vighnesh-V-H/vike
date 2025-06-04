import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { leadSchema } from "@/lib/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

// Define a type for lead insertion
type LeadInsert = typeof leads.$inferInsert;

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch from database
    const result = await db.select().from(leads);
    return NextResponse.json(result);

    // For development, uncomment to use mock data
    // return NextResponse.json(MOCK_LEADS);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Parse tags if they are a string
    let parsedTags = body.tags;
    if (typeof body.tags === "string") {
      try {
        parsedTags = JSON.parse(body.tags);
      } catch (e) {
        // If parsing fails, use the string as is
        parsedTags = body.tags ? [body.tags] : [];
      }
    }

    // Convert value to number if it's a string
    let numericValue = null;
    if (body.value) {
      numericValue =
        typeof body.value === "string" ? parseFloat(body.value) : body.value;

      if (isNaN(numericValue)) {
        numericValue = null;
      }
    }

    // Prepare the data for validation
    const leadData = {
      ...body,
      tags:
        typeof parsedTags === "object"
          ? JSON.stringify(parsedTags)
          : parsedTags,
      value: numericValue,
    };

    // Validate the lead data using Zod schema
    const validationResult = leadSchema.safeParse(leadData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create a properly typed lead object for insertion
    const leadToInsert: LeadInsert = {
      fullName: validatedData.fullName,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      companyName: validatedData.companyName || null,
      jobTitle: validatedData.jobTitle || null,
      source: validatedData.source || null,
      tags: validatedData.tags || null,
      status: validatedData.status,
      priority: validatedData.priority,
      value: validatedData.value ? String(validatedData.value) : null,
      assignedTo: validatedData.assignedTo || null,
      notes: validatedData.notes || null,
      position: validatedData.position,
    };

    // Insert into database
    const result = await db.insert(leads).values(leadToInsert).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
