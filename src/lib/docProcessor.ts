// lib/docProcessor.ts
import { db } from "@/db";
import { chunk, documents, embeddingJobs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { splitDocumentIntoChunks } from "./chunker";
import { createEmbedding } from "./embedding";

export async function processDocument(documentId: number): Promise<void> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));

  if (!document) throw new Error(`Document ${documentId} not found`);

  const [job] = await db
    .insert(embeddingJobs)
    .values({
      sourceType: document.sourceType,
      documentId: document.id,
      userId: document.userId,
      status: "processing",
      totalChunks: 0,
      processedChunks: 0,
      progress: 0,
    })
    .returning();

  try {
    const chunks = splitDocumentIntoChunks(document.content);
    await db
      .update(embeddingJobs)
      .set({ totalChunks: chunks.length })
      .where(eq(embeddingJobs.id, job.id));

    for (const [index, chunkText] of chunks.entries()) {
      try {
        const embedding = await createEmbedding(chunkText);

        await db.insert(chunk).values({
          documentId: document.id,
          textContent: chunkText,
          orderInDocument: index,
          embeddings: embedding,
        });

        await db
          .update(embeddingJobs)
          .set({
            processedChunks: sql`${embeddingJobs.processedChunks} + 1`,
            progress: Math.round(((index + 1) / chunks.length) * 100),
          })
          .where(eq(embeddingJobs.id, job.id));
      } catch (error) {
        console.error(`Chunk ${index} failed:`, error);
      }
    }

    await db
      .update(embeddingJobs)
      .set({ status: "completed", progress: 100 })
      .where(eq(embeddingJobs.id, job.id));
  } catch (error) {
    await db
      .update(embeddingJobs)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(embeddingJobs.id, job.id));
    throw error;
  }
}
