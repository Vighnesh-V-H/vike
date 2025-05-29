import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOAuth2Client } from "@/lib/integrations/google/google";
import {
  getSheetData,
  updateSheetData,
  appendSheetData,
} from "@/lib/integrations/google/googleSheets";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { google } from "googleapis";

// GET: Get data from a specific Google Sheet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  const session = await auth();
  const { sheetId } = await params; // Await params before accessing properties

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sheetId) {
    return NextResponse.json(
      { error: "Sheet ID is required" },
      { status: 400 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "Sheet1!A1:Z1000";

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

    // Get the sheet data
    const data = await getSheetData(oauth2Client, sheetId, range);
    console.log(data);

    console.log(
      "Sheet data fetched, rows:",
      data.length,
      "first row columns:",
      data[0]?.length || 0
    );

    // Ensure we're returning the right format - an array of arrays (rows of columns)
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error getting Google Sheet data:", error);
    return NextResponse.json(
      { error: "Failed to get Google Sheet data" },
      { status: 500 }
    );
  }
}

// PATCH: Update data in a specific Google Sheet
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  const session = await auth();
  const { sheetId } = await params; // Await params before accessing properties

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sheetId) {
    return NextResponse.json(
      { error: "Sheet ID is required" },
      { status: 400 }
    );
  }

  try {
    const { range, values, append = false } = await req.json();

    if (!range || !values || !Array.isArray(values)) {
      return NextResponse.json(
        { error: "Range and values array are required" },
        { status: 400 }
      );
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

    // Update or append the sheet data
    let result;
    if (append) {
      result = await appendSheetData(oauth2Client, sheetId, range, values);
    } else {
      result = await updateSheetData(oauth2Client, sheetId, range, values);
    }

    return NextResponse.json({
      result,
      success: true,
      message: append
        ? "Data appended successfully"
        : "Data updated successfully",
    });
  } catch (error) {
    console.error("Error updating Google Sheet data:", error);
    return NextResponse.json(
      { error: "Failed to update Google Sheet data" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific Google Sheet (moves it to trash)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  const session = await auth();
  const { sheetId } = await params; // Await params before accessing properties

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sheetId) {
    return NextResponse.json(
      { error: "Sheet ID is required" },
      { status: 400 }
    );
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

    // Delete the sheet (move to trash)
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    await drive.files.update({
      fileId: sheetId,
      requestBody: {
        trashed: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sheet with ID ${sheetId} has been moved to trash`,
    });
  } catch (error) {
    console.error("Error deleting Google Sheet:", error);
    return NextResponse.json(
      { error: "Failed to delete Google Sheet" },
      { status: 500 }
    );
  }
}
