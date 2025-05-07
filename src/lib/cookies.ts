import { cookies } from "next/headers";
import { encrypt } from "@/lib/encryption";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function setIntegrationCookie(
  integrationId: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("google_integration_id", integrationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
}

export async function getIntegrationCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("google_integration_id")?.value;
}

export async function refreshIntegrationCookie(userId: string): Promise<void> {
  // Find the user's active Google integration
  const userIntegration = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.type, "google"),
        eq(integrations.isActive, true)
      )
    )
    .orderBy(desc(integrations.createdAt))
    .limit(1)
    .then((rows) => rows[0] || null);

  if (userIntegration) {
    await setIntegrationCookie(userIntegration.id);
  }
}
