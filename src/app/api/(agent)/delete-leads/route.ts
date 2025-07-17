import { auth } from "@/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { deleteRequestSchema } from "@/lib/schema";
import { and, inArray, eq } from "drizzle-orm";


export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const validation = deleteRequestSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { leadIds } = validation.data;

    const result = await db
      .delete(leads)
      .where(and(eq(leads.userId, userId), inArray(leads.id, leadIds)))
      .returning({ deletedId: leads.id });

    if (result.length === 0) {
      return Response.json(
        {
          error:
            "No leads were deleted. They may not exist or you may not have permission.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: `Successfully deleted ${result.length} leads.`,
      deletedCount: result.length,
    });
  } catch (error: any) {
    console.error("Error deleting leads:", error);
    return Response.json(
      {
        error: "Failed to delete leads",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
