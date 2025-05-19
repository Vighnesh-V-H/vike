import { NextRequest, NextResponse } from "next/server";
import { getDocs, getOAuth2Client } from "@/lib/integrations/google/google";
import { getGoogleTasks } from "@/lib/integrations/google/googleTasks";
import { auth } from "@/auth";

import crypto from "crypto";
import { setIntegrationCookie } from "@/lib/cookies";
import { encrypt } from "@/lib/encryption";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { handleGoogleDoc } from "@/lib/integrations/google/googleDoc";
import { google } from "googleapis";

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
        data: tokens as any,
        isActive: true,
      })
      .returning();

    if (tokens.refresh_token) {
      oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });

      // ✅ Process Google Docs
      const files = await getDocs(oauth2Client);
      for (const file of files) {
        try {
          await handleGoogleDoc(file, oauth2Client, integrated.userId);
        } catch (err: any) {
          console.error(
            `❌ Error processing file "${file.name}": ${err.message}`
          );
        }
      }

      // ✅ Fetch Google Tasks
      try {
        const taskLists = await getGoogleTasks(oauth2Client);
        console.log("📋 Synced Google Tasks:", taskLists);

        // Optional: Store in DB
        // await saveTasksToDatabase(taskLists, userId);
      } catch (taskError: any) {
        console.error("❌ Error fetching Google Tasks:", taskError.message);
      }
    }

    await setIntegrationCookie(integrationId);
    return NextResponse.redirect(new URL("/integrations", request.url));
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    const errorMessage = error?.message || "OAuth callback failed";
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
