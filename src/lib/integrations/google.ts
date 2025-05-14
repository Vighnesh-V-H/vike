import { google } from "googleapis";
import chunkText from "../chunker";
import { db } from "@/db";

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
  return [
    "https://www.googleapis.com/auth/drive.readonly",
    "email profile",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.file",
  ];
}

export async function getDocs(oauth2Client: any) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
  });

  console.log(res.data.files);

  const files = res.data.files || [];

  return files;
}
