import crypto from "crypto";
import { google, GoogleApis } from "googleapis";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { documentQueue } from "@/lib/queue";
import { startWorker } from "@/lib/workers";
import { eq } from "drizzle-orm";

import { drive_v3 } from "googleapis";

type DriveFile = drive_v3.Schema$File;

type OAuth2Client = typeof google.prototype.auth.OAuth2.prototype;

export async function handleGoogleDoc(
  file: DriveFile,
  oauth2Client: OAuth2Client,
  userId: string
) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

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
    return;
  }

  const exportRes = await drive.files.export(
    {
      fileId: file.id!,
      mimeType: "text/plain",
    },
    { responseType: "stream" }
  );

  const chunks: Uint8Array<ArrayBufferLike>[] = [];
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
    await documentQueue.add("process-existing", {
      documentId: existing.id,
    });
    const worker = startWorker();
    console.log(worker);
    return;
  }

  const [document] = await db
    .insert(documents)
    .values({
      // @ts-expect-error valid source  type
      sourceType: "google_docs",
      sourceId: file.id,
      title: file.name,
      fileName: file.name,
      mimeType: file.mimeType!,
      content,
      userId,
      contentHash,
      processingStatus: "pending",
      description: file.description || "",
      metadata: {
        googleDocUrl: file.webContentLink,
        lastModified: file.modifiedTime,
      } as const,
    })
    .returning();

  await documentQueue.add("process-new", {
    documentId: document.id,
  });

  const worker = startWorker();
  console.log(worker);
}
