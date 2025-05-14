import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { integrations } from "@/db/schema";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { isConnected: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user has an active Google integration
    const userIntegration = await db
      .select({ id: integrations.id })
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.type, "google"),
          eq(integrations.isActive, true)
        )
      )
      .limit(1);

    return NextResponse.json({
      isConnected: userIntegration.length > 0,
    });
  } catch (error) {
    console.error("Error checking Google integration status:", error);
    return NextResponse.json(
      { isConnected: false, error: "Failed to check integration status" },
      { status: 500 }
    );
  }
}
