import { NextRequest, NextResponse } from "next/server";
import { getDocs, getOAuth2Client } from "@/lib/integrations/google";
import { auth } from "@/auth";

import crypto from "crypto";
import { setIntegrationCookie } from "@/lib/cookies";
import { encrypt } from "@/lib/encryption"; // Create this utility for sensitive data
import { db } from "@/db";
import { documents, integrations } from "@/db/schema";
import { google } from "googleapis";
import { eq } from "drizzle-orm";
import { processDocument } from "@/lib/docProcessor";
import { documentQueue } from "@/lib/queue";
import { startWorker } from "@/lib/workers";

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
        refreshToken: encryptedRefreshToken, // Store encrypted token
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? null,
        tokenType: tokens.token_type ?? null,
        data: tokens as any, // Consider encrypting or removing sensitive parts
        isActive: true,
      })
      .returning();

    if (tokens.refresh_token) {
      oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
      const files = await getDocs(oauth2Client);
      const drive = google.drive({ version: "v3", auth: oauth2Client });

      for (const file of files) {
        console.log(`📄 ${file.name}`);
        console.log(file);

        // First, check if the file is exportable
        try {
          const metadataRes = await drive.files.get({
            fileId: file.id!,
            fields: "owners,capabilities,mimeType",
          });

          const metadata = metadataRes.data;
          const canExport =
            metadata.capabilities?.canDownload &&
            metadata.owners?.some((owner) => owner.me);

          if (!canExport) {
            console.warn(
              `⚠️ Skipping file "${file.name}" — not exportable by this user.`
            );
            continue;
          }

          // Export the file
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

          const contentHash = crypto
            .createHash("sha256")
            .update(file.id as string)
            .digest("hex");

          const [existing] = await db
            .select()
            .from(documents)
            .where(eq(documents.contentHash, contentHash))
            .limit(1);

          if (existing) {
            const res = await documentQueue.add("process-existing", {
              documentId: existing.id,
            });
            const worker = startWorker();
            console.log(worker);
          }

          if (!existing) {
            const [document] = await db
              .insert(documents)
              .values({
                // @ts-expect-error
                sourceType: "google_docs",
                sourceId: file.id!,
                title: file.name,
                fileName: file.name,
                mimeType: file.mimeType!,
                content,
                userId: integrated.userId,
                contentHash,
                processingStatus: "pending",
                description: file.description || "",
                metadata: {
                  googleDocUrl: file.webContentLink,
                  lastModified: file.modifiedTime,
                } as const,
              })
              .returning();
            const res = await documentQueue.add("process-new", {
              documentId: document.id,
            });

            const worker = startWorker();
            console.log(worker);
          }
        } catch (err: any) {
          console.error(
            `❌ Error processing file "${file.name}": ${err.message}`
          );
        }
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
