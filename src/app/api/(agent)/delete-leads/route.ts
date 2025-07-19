import { auth } from "@/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { deleteFilterSchema } from "@/lib/schema";
import { and, eq, or, like, SQL } from "drizzle-orm";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    const filters = await req.json();

    const validation = deleteFilterSchema.safeParse(filters);
    if (!validation.success) {
      return Response.json(
        { error: "Invalid filters provided" },
        { status: 400 }
      );
    }
    const { identifier, status, priority, source } = validation.data;

    const conditions: (SQL | undefined)[] = [eq(leads.userId, userId)];

    if (identifier) {
      conditions.push(
        or(eq(leads.fullName, identifier), eq(leads.email, identifier))
      );
    }
    if (status) {
      conditions.push(
        eq(leads.status, status as "new" | "contacted" | "won" | "lost")
      );
    }
    if (priority) {
      conditions.push(
        eq(leads.priority, priority as "high" | "medium" | "low")
      );
    }
    if (source) {
      conditions.push(eq(leads.source, source));
    }

    // 3. Safety Check: Ensure at least one filter is applied
    if (conditions.length <= 1) {
      return Response.json(
        { error: "An identifier or filter is required for deletion." },
        { status: 400 }
      );
    }

    // 4. Execute deletion in the DB
    const result = await db
      .delete(leads)
      .where(and(...conditions))
      .returning({ deletedId: leads.id });

    if (result.length === 0) {
      return Response.json(
        { message: "No leads found matching the criteria to delete." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: `Successfully deleted ${result.length} lead(s).`,
      deletedCount: result.length,
    });
  } catch (error: any) {
    console.error("Error during bulk delete:", error);
    return Response.json(
      { error: "Failed to delete leads", details: error.message },
      { status: 500 }
    );
  }
}
