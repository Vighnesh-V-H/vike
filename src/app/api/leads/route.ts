import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { leadSchema } from "@/lib/schema";
import { auth } from "@/auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { type Lead } from "@/lib/leads/types";

type LeadInsert = typeof leads.$inferInsert;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (fromParam && toParam) {
      let from: Date, to: Date;
      try {
        from = new Date(fromParam);
        to = new Date(toParam);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }

      const fetchedLeads = await db
        .select()
        .from(leads)
        .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to)))
        .orderBy(leads.createdAt);

      const transformedLeads = fetchedLeads.map((lead) => {
        let parsedTags = null;
        if (lead.tags) {
          try {
            parsedTags = JSON.parse(lead.tags);
          } catch (e) {
            parsedTags = lead.tags;
          }
        }

        return {
          id: lead.id,
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          companyName: lead.companyName,
          jobTitle: lead.jobTitle,
          status: lead.status,
          priority: lead.priority || "medium",
          value: lead.value ? String(lead.value) : null,
          tags: parsedTags,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          position: lead.position,
        } as Lead;
      });

      return NextResponse.json(transformedLeads);
    }

    const result = await db.select().from(leads);

    const transformedLeads = result.map((lead) => {
      let parsedTags = null;
      if (lead.tags) {
        try {
          parsedTags = JSON.parse(lead.tags);
        } catch (e) {
          parsedTags = lead.tags;
        }
      }

      return {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        jobTitle: lead.jobTitle,
        status: lead.status,
        priority: lead.priority || "medium",
        value: lead.value ? String(lead.value) : null,
        tags: parsedTags,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        position: lead.position,
      } as Lead;
    });

    return NextResponse.json(transformedLeads);
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Batch support: if body is an array, handle batch insert
    if (Array.isArray(body)) {
      // Validate all leads
      const validationResults = body.map((lead: any) =>
        leadSchema.safeParse(lead)
      );
      const allValid = validationResults.every((result) => result.success);

      if (!allValid) {
        // Collect errors for invalid leads
        const errors = validationResults
          .map((result, idx) =>
            result.success ? null : { index: idx, error: result.error.format() }
          )
          .filter(Boolean);
        return NextResponse.json(
          {
            error: "Validation failed for one or more leads",
            details: errors,
          },
          { status: 400 }
        );
      }

      // All valid, prepare for insert
      const leadsToInsert = validationResults.map((result: any) => {
        const validatedData = result.data;
        return {
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
      });

      const result = await db.insert(leads).values(leadsToInsert).returning();
      return NextResponse.json(result, { status: 201 });
    }

    // Single object: keep existing behavior
    let parsedTags = body.tags;
    if (typeof body.tags === "string") {
      try {
        parsedTags = JSON.parse(body.tags);
      } catch (e) {
        parsedTags = body.tags ? [body.tags] : [];
      }
    }

    let numericValue = null;
    if (body.value) {
      numericValue =
        typeof body.value === "string" ? parseFloat(body.value) : body.value;

      if (isNaN(numericValue)) {
        numericValue = null;
      }
    }

    const leadData = {
      ...body,
      tags:
        typeof parsedTags === "object"
          ? JSON.stringify(parsedTags)
          : parsedTags,
      value: numericValue,
    };

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

    const leadToInsert: LeadInsert = {
      fullName: validatedData.fullName,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      companyName: validatedData.companyName || null,
      jobTitle: validatedData.jobTitle || null,
      source: validatedData.source || null,
      tags: Array.isArray(validatedData.tags)
        ? JSON.stringify(validatedData.tags)
        : validatedData.tags || null,
      status: validatedData.status,
      priority: validatedData.priority,
      value: validatedData.value ? String(validatedData.value) : null,
      assignedTo: validatedData.assignedTo || null,
      notes: validatedData.notes || null,
      position: validatedData.position,
    };

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
