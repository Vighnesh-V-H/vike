import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
// import { auth } from "@/lib/auth";

// Mock data for development
const MOCK_LEADS = [
  {
    id: 1,
    fullName: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    companyName: "Acme Corp",
    jobTitle: "CEO",
    status: "new",
    priority: "high",
    value: 50000,
    tags: ["enterprise", "saas"],
    createdAt: new Date("2023-05-15"),
    position: 0,
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-987-6543",
    companyName: "TechStart Inc",
    jobTitle: "CTO",
    status: "contacted",
    priority: "medium",
    value: 25000,
    tags: ["startup", "tech"],
    createdAt: new Date("2023-05-18"),
    position: 0,
  },
  // Add more mock leads as needed
];

export async function GET(req: NextRequest) {
  try {
    // In production, fetch from database
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // const result = await db.select().from(leads);
    // return NextResponse.json(result);

    // For development, return mock data
    return NextResponse.json(MOCK_LEADS);
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
    // In production, insert into database
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();

    // Validate required fields
    if (!body.fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // In production, insert into database
    // const result = await db.insert(leads).values({
    //   fullName: body.fullName,
    //   email: body.email,
    //   phone: body.phone,
    //   companyName: body.companyName,
    //   jobTitle: body.jobTitle,
    //   source: body.source,
    //   campaign: body.campaign,
    //   tags: body.tags || [],
    //   status: body.status || "new",
    //   priority: body.priority || "medium",
    //   value: body.value,
    //   assignedTo: body.assignedTo,
    //   notes: body.notes,
    //   position: body.position || 0,
    // }).returning();

    // For development, just return the created lead with a mock ID
    const newLead = {
      ...body,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
