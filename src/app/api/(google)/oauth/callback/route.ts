import { NextRequest, NextResponse } from "next/server";
import { getDocs, getOAuth2Client } from "@/lib/integrations/google/google";
import { auth } from "@/auth";
import crypto from "crypto";
import { setIntegrationCookie } from "@/lib/cookies";
import { encrypt } from "@/lib/encryption";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { handleGoogleDoc } from "@/lib/integrations/google/googleDoc";
import { AuthenticationError, IntegrationError } from "@/lib/exceptions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthenticationError();
  }

  if (error) {
    throw new IntegrationError(error);
  }

  if (!code) {
    throw new IntegrationError("Missing authorization code");
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const integrationId = crypto.randomUUID();
    const encryptedRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token)
      : null;

    const [integrated] = await db
      .insert(integrations)
      .values({
        id: integrationId,
        userId,
        type: "google",
        name: "google_oauth",
        accessToken: tokens.access_token ?? null,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? null,
        tokenType: tokens.token_type ?? null,
        data: tokens,
        isActive: true,
      })
      .returning();

    if (tokens.refresh_token) {
      oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
      const files = await getDocs(oauth2Client);

      await Promise.allSettled(
        files.map((file) =>
          handleGoogleDoc(file, oauth2Client, integrated.userId)
        )
      );
    }

    await setIntegrationCookie(integrationId);
    return NextResponse.redirect(
      new URL("/integrations?success=true", request.url)
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new IntegrationError(error.message);
    }
    throw new IntegrationError("Failed to integrate with Google");
  }
}