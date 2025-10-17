import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOAuth2Client } from "@/lib/integrations/google/google";
import { getSheets, createSheet } from "@/lib/integrations/google/googleSheets";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";


export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the user's Google integration
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const userIntegration = await db
      .select({ id: integrations.id, refreshToken: integrations.refreshToken })
      .from(integrations)
      .where(
        and(eq(integrations.userId, userId), eq(integrations.type, "google"))
      )
      .limit(1);

    if (userIntegration.length === 0 || !userIntegration[0].refreshToken) {
      return NextResponse.json(
        {
          error:
            "Google integration not found. Please connect your Google account first.",
        },
        { status: 404 }
      );
    }

    // Get an OAuth2 client with the user's refresh token
    const oauth2Client = getOAuth2Client();
    const refreshToken = await decrypt(userIntegration[0].refreshToken);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Fetch actual sheets from the user's Google Drive
    const sheets = await getSheets(oauth2Client);

    return NextResponse.json({ sheets });
  } catch (error) {
    console.error("Error listing Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to list Google Sheets" },
      { status: 500 }
    );
  }
}

// POST: Create a new Google Sheet
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the user's Google integration
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const userIntegration = await db
      .select({ id: integrations.id, refreshToken: integrations.refreshToken })
      .from(integrations)
      .where(
        and(eq(integrations.userId, userId), eq(integrations.type, "google"))
      )
      .limit(1);

    if (userIntegration.length === 0 || !userIntegration[0].refreshToken) {
      return NextResponse.json(
        {
          error:
            "Google integration not found. Please connect your Google account first.",
        },
        { status: 404 }
      );
    }

    // Get an OAuth2 client with the user's refresh token
    const oauth2Client = getOAuth2Client();
    const refreshToken = await decrypt(userIntegration[0].refreshToken);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Create a new Google Sheet
    const sheet = await createSheet(oauth2Client, title);

    return NextResponse.json({ sheet });
  } catch (error) {
    console.error("Error creating Google Sheet:", error);
    return NextResponse.json(
      { error: "Failed to create Google Sheet" },
      { status: 500 }
    );
  }
}
