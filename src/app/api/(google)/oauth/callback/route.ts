import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/integrations/google";
import { auth } from "@/auth";

import crypto from "crypto";
import { setIntegrationCookie } from "@/lib/cookies";
import { encrypt } from "@/lib/encryption"; // Create this utility for sensitive data
import { db } from "@/db";
import { integrations } from "@/db/schema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.redirect(
      new URL("/error?message=User+not+authenticated", request.url)
    );
  }

  if (error) {
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/error?message=Missing+authorization+code", request.url)
    );
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    // Generate a unique ID for this integration
    const integrationId = crypto.randomUUID();

    // encrypting sensitive tokens
    const encryptedRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token)
      : null;

    await db.insert(integrations).values({
      id: integrationId,
      userId,
      type: "google",
      name: "google_oauth",
      accessToken: tokens.access_token ?? null,
      refreshToken: encryptedRefreshToken, // Store encrypted token
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scope: tokens.scope ?? null,
      tokenType: tokens.token_type ?? null,
      data: tokens as any, // Consider encrypting or removing sensitive parts
      isActive: true,
    });

    // Set a secure cookie with integration ID
    await setIntegrationCookie(integrationId);

    // Redirect to success page
    return NextResponse.redirect(new URL("/integrations", request.url));
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    const errorMessage = error?.message || "OAuth callback failed";
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
