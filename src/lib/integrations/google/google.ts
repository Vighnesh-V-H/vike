import { google } from "googleapis";

const dotenv = require('dotenv');
dotenv.config();

export function getOAuth2Client() {
 
const credentials = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRETT,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI,
};


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
