import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // For now, we'll simulate connection status
    // In a real implementation, you would check for a valid token in the database
    // This is a placeholder implementation
    const isConnected = false;

    return NextResponse.json({ isConnected });
  } catch (error) {
    console.error("Error checking Excel connection status:", error);
    return NextResponse.json(
      { error: "Failed to check Excel connection status" },
      { status: 500 }
    );
  }
}
