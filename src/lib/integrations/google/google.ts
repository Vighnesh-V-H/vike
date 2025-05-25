import { google } from "googleapis";

const dotenv = require('dotenv');
dotenv.config();

const credentials = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: process.env.NODE_ENV === 'production' 
    ? 'https://vike-pv5b.vercel.app/api/oauth/callback'
    : `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/oauth/callback`,
};

export function getOAuth2Client() {

  console.log(credentials.client_id , credentials.client_secret)

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
    "https://www.googleapis.com/auth/tasks",
  ];
}

type OAuth2Client = typeof google.prototype.auth.OAuth2.prototype;

export async function getDocs(oauth2Client: OAuth2Client) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
  });

  const files = res.data.files || [];

  return files;
}
