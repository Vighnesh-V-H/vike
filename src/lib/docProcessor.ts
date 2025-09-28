// lib/docProcessor.ts (temporarily disabled)
// import { db } from "@/db";
// import { chunk, documents, embeddingJobs } from "@/db/schema";
// import { eq, sql } from "drizzle-orm";
// import { splitDocumentIntoChunks } from "./chunker";
// import { createEmbedding } from "./embedding";

export async function processDocument(documentId: number): Promise<void> {
  console.warn("Document processing is currently disabled.", {
    documentId,
  });
  return;
}

/*
Original implementation (commented out for RAG removal validation):

...existing code...

*/
