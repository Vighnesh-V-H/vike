import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { decrypt, encrypt } from "@/lib/encryption";
import { getOAuth2Client } from "@/lib/integrations/google/google";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [integration] = await db
      .select({
        id: integrations.id,
        accessToken: integrations.accessToken,
        refreshToken: integrations.refreshToken,
        expiresAt: integrations.expiresAt,
        isActive: integrations.isActive,
        data: integrations.data,
        scope: integrations.scope,
        tokenType: integrations.tokenType,
      })
      .from(integrations)
      .where(
        and(eq(integrations.userId, userId), eq(integrations.type, "google"))
      )
      .limit(1);

    if (!integration) {
      return NextResponse.json({
        isConnected: false,
        isExpired: false,
        expiresAt: null,
      });
    }

    let latestAccessToken = integration.accessToken;
    let latestRefreshToken = integration.refreshToken;
    let latestExpiresAt = integration.expiresAt;
    let latestScope = integration.scope;
    let latestTokenType = integration.tokenType;
    let latestData = integration.data ?? {};
    

    let isExpired = latestExpiresAt ? latestExpiresAt.getTime() <= Date.now() : false;
    console.log(isExpired)

    if (isExpired && latestRefreshToken) {
      try {
        const refreshToken = await decrypt(latestRefreshToken);
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        const { credentials } = await oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
          throw new Error("Missing access token in refresh response");
        }

        latestAccessToken = credentials.access_token;
        latestExpiresAt = credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null;
        latestScope = credentials.scope ?? latestScope;
        latestTokenType = credentials.token_type ?? latestTokenType;
        latestData = {
          ...latestData,
          ...credentials,
          refreshedAt: new Date().toISOString(),
        };

        if (credentials.refresh_token) {
          latestRefreshToken = await encrypt(credentials.refresh_token);
        }

        await db
          .update(integrations)
          .set({
            accessToken: latestAccessToken,
            refreshToken: latestRefreshToken,
            expiresAt: latestExpiresAt,
            scope: latestScope,
            tokenType: latestTokenType,
            data: latestData,
          })
          .where(eq(integrations.id, integration.id));

        isExpired = latestExpiresAt
          ? latestExpiresAt.getTime() <= Date.now()
          : false;
      } catch (refreshError) {
        console.error("Failed to refresh Google OAuth token:", refreshError);
      }
    }

    const isConnected = Boolean(latestAccessToken && integration.isActive && !isExpired);

    return NextResponse.json({
      isConnected,
      isExpired,
      expiresAt: latestExpiresAt,
    });
  } catch (error) {
    console.error("Error checking Google OAuth status:", error);
    return NextResponse.json(
      { error: "Failed to determine Google OAuth status" },
      { status: 500 }
    );
  }
}
