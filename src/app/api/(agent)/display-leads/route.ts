import { auth } from "@/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { and, eq, like, SQL } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // 1. Authenticate the user and get their ID
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Extract search parameters from the request URL
    const { searchParams } = new URL(req.url);

    // 3. Dynamically build the filter conditions for the database query
    const conditions: (SQL | undefined)[] = [
      // Base condition: always filter by the logged-in user's ID for security
      eq(leads.userId, userId),
    ];

    if (searchParams.has("status")) {
      // The `as` cast is safe here because the DB schema and Zod enum should match
      conditions.push(
        eq(
          leads.status,
          searchParams.get("status")! as "new" | "contacted" | "won" | "lost"
        )
      );
    }
    if (searchParams.has("priority")) {
      conditions.push(
        eq(
          leads.priority,
          searchParams.get("priority")! as "high" | "medium" | "low"
        )
      );
    }
    if (searchParams.has("source")) {
      conditions.push(eq(leads.source, searchParams.get("source")!));
    }
    if (searchParams.has("assignedTo")) {
      conditions.push(eq(leads.assignedTo, searchParams.get("assignedTo")!));
    }
    if (searchParams.has("email")) {
      conditions.push(eq(leads.email, searchParams.get("email")!));
    }

    if (searchParams.has("tag")) {
      conditions.push(like(leads.tags, `%${searchParams.get("tag")!}%`));
    }

    // 4. Execute the query with all the combined filters
    const filteredLeads = await db
      .select()
      .from(leads)
      .where(and(...conditions));

    // 5. Return the results
    return Response.json({
      success: true,
      foundCount: filteredLeads.length,
      data: filteredLeads,
    });
  } catch (error: any) {
    console.error("Error searching leads:", error);
    return Response.json(
      {
        error: "Failed to search for leads",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
