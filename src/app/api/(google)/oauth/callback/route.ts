import { NextRequest, NextResponse } from "next/server";
import { getDocs, getOAuth2Client } from "@/lib/integrations/google/google";
import { auth } from "@/auth";

import crypto from "crypto";
import { setIntegrationCookie } from "@/lib/cookies";
import { encrypt } from "@/lib/encryption";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { handleGoogleDoc } from "@/lib/integrations/google/googleDoc";

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
    console.log("🔄 Starting OAuth callback process");

    const oauth2Client = getOAuth2Client();
    console.log("✅ OAuth client created");

    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ Tokens received:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });

    const integrationId = crypto.randomUUID();
    const encryptedRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token)
      : null;

    console.log("🔄 Inserting into database...");
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

    console.log("✅ Database insert successful");

    if (tokens.refresh_token) {
      oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });

      console.log("🔄 Processing Google Docs...");
      try {
        const files = await getDocs(oauth2Client);
        console.log(`📄 Found ${files.length} Google Docs`);

        for (const file of files) {
          try {
            await handleGoogleDoc(file, oauth2Client, integrated.userId);
            console.log(`✅ Processed: ${file.name}`);
          } catch (docError) {
            console.error(`❌ Error processing file "${file.name}":`, docError);
            // Don't throw here - continue processing other docs
          }
        }
      } catch (docsError) {
        console.error("❌ Error getting Google Docs:", docsError);
        // Don't fail the entire flow for docs processing
      }
    }

    console.log("🔄 Setting integration cookie...");
    await setIntegrationCookie(integrationId);

    console.log("✅ OAuth callback completed successfully");
    return NextResponse.redirect(new URL("/integrations", request.url));
  } catch (error) {
    console.error("❌ OAuth callback failed:", error);

    const errorMessage = `OAuth callback failed`;
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}