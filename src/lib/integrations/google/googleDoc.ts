import type { drive_v3 } from "googleapis";
import { google } from "googleapis";

type DriveFile = drive_v3.Schema$File;
type OAuth2Client = typeof google.prototype.auth.Oauth2.prototype;

export async function handleGoogleDoc(
  file: DriveFile,
  oauth2Client: OAuth2Client,
  userId: string
) {
  console.warn(
    "Google Doc ingestion is currently disabled; ignoring document upload request.",
    {
      fileId: file?.id,
      userId,
    }
  );

  return;
}

/*
Original implementation (temporarily disabled):

import crypto from "crypto";
import { google, GoogleApis } from "googleapis";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { documentQueue } from "@/lib/queue";
import { startWorker } from "@/lib/workers";
import { eq } from "drizzle-orm";

...existing code...

*/
