import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  try {
    // Get the authorization code from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/integrations?error=no_code", request.url)
      );
    }

    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // In a real application, you would save these tokens to a database
    // associated with the current user
    // For this example, we'll just redirect to the integrations page

    // Redirect back to the integrations page
    return NextResponse.redirect(
      new URL("/integrations?success=true", request.url)
    );
  } catch (error) {
    console.error("Error in Excel OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=auth_failed", request.url)
    );
  }
}
