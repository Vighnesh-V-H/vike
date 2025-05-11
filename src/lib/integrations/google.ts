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

export async function getDocs(oauth2Client: any) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
    pageSize: 2,
  });

  console.log(res.data.files);

  const files = res.data.files || [];

  for (const file of files) {
    console.log(`📄 ${file.name}`);

    const exportRes = await drive.files.export(
      {
        fileId: file.id!,
        mimeType: "text/plain",
      },
      { responseType: "stream" }
    );

    const chunks: any[] = [];
    exportRes.data.on("data", (chunk) => chunks.push(chunk));
    await new Promise((resolve) => exportRes.data.on("end", resolve));
    const content = Buffer.concat(chunks).toString("utf-8");
  }
}
