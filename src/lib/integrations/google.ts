// "use server";

// import { auth } from "@/auth";
// import { google } from "googleapis";

// const credentials = {
//   client_id: process.env.GOOGLE_CLIENT_ID,
//   client_secret: process.env.GOOGLE_CLIENT_SECRET,
//   redirect_uri: "http://localhost:3000/api/oauth/callback",
// };

// function getOAuth2Client() {
//   if (!credentials.client_id || !credentials.client_secret) {
//     throw new Error(
//       "Missing Google OAuth credentials in environment variables"
//     );
//   }

//   return new google.auth.OAuth2(
//     credentials.client_id,
//     credentials.client_secret,
//     credentials.redirect_uri
//   );
// }

// export async function generateGoogleAuthUrl() {
//   const oauth2Client = getOAuth2Client();

//   const scopes = [
//     "https://www.googleapis.com/auth/spreadsheets.readonly",
//     "https://www.googleapis.com/auth/drive.readonly",
//   ];

//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     prompt: "consent",
//     scope: scopes,
//     include_granted_scopes: true,
//   });

//   return authUrl;
// }

// export async function exchangeCodeForTokens(code: string) {
//   const oauth2Client = getOAuth2Client();

//   try {
//     const session = await auth();
//     const userId = session?.user?.id;

//     if (!userId) {
//       throw new Error("User not authenticated");
//     }

//     const { tokens } = await oauth2Client.getToken(code);

//     console.log(tokens);

//     const expiresAt = tokens.expiry_date
//       ? new Date(tokens.expiry_date)
//       : new Date(Date.now() + 3600 * 1000);

//     return tokens;
//   } catch (error) {
//     console.error("Error during token exchange:", error);
//     throw error;
//   }
// }

// const cookieStore = await cookies();

// cookieStore.set("google_access_token", tokens.access_token!, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   maxAge: 30 * 24 * 60 * 60, // 30 days
//   path: "/",
// });

// Set refresh token with 1 year expiry
// cookieStore.set("google_refresh_token", tokens.refresh_token!, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   maxAge: 365 * 24 * 60 * 60, // 1 year
//   path: "/",
// });

// Store tokens in database for long-term persistence
// await db.integration.upsert({
//   where: {
//     // Use the composite unique constraint
//     userId_type_name: {
//       userId,
//       type: "GOOGLE",
//       name: "GOOGLE_SHEETS",
//     },
//   },
//   update: {
//     accessToken: tokens.access_token!,
//     refreshToken: tokens.refresh_token!,
//     expiresAt,
//     tokenType: tokens.token_type,
//     scope: tokens.scope,
//     isActive: true,
//     data: tokens as any, // Store full token object for reference
//   },
//   create: {
//     userId,
//     type: "GOOGLE",
//     name: "GOOGLE_SHEETS",
//     accessToken: tokens.access_token!,
//     refreshToken: tokens.refresh_token!,
//     expiresAt,
//     tokenType: tokens.token_type,
//     scope: tokens.scope,
//     data: tokens as any, // Store full token object for reference
//   },
// });

import { google } from "googleapis";

const credentials = {
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: "http://localhost:3000/api/oauth/callback",
};

export function getOAuth2Client() {
  if (!credentials.client_id || !credentials.client_secret) {
    throw new Error(
      "Missing Google OAuth credentials in environment variables"
    );
  }

  return new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uri
  );
}

export function getScopes() {
  return ["https://www.googleapis.com/auth/drive.readonly", "email profile"];
}
