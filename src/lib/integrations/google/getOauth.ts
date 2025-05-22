import { google } from "googleapis";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";

export async function getOAuth2ClientForUser(userId: string) {
  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(eq(integrations.userId, userId), eq(integrations.type, "google"))
    )
    .limit(1);

  if (!integration) {
    throw new Error("No Google integration found for user");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!
  );

  if (!integration.refreshToken) {
    throw new Error("No refresh token available");
  }

  const refreshToken = await decrypt(integration.refreshToken);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}
