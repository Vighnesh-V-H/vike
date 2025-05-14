import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { chunk, documents, embeddingJobs } from "@/db/schema";
import { eq } from "drizzle-orm";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Split document content into chunks with some overlap
 */
export function splitDocumentIntoChunks(content: string): string[] {
  console.log("\n\n chunkstart");
  if (!content) return [];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < content.length) {
    // Calculate end index with some overlap
    const endIndex = Math.min(startIndex + CHUNK_SIZE, content.length);

    // Extract chunk
    const chunk = content.substring(startIndex, endIndex);
    chunks.push(chunk);

    // Move start index for next chunk, accounting for overlap
    startIndex = endIndex - CHUNK_OVERLAP;

    // If we can't move forward, break to avoid infinite loop
    if (endIndex === content.length) break;
  }

  return chunks;
}

/**
 * Create embeddings for a chunk of text using Google AI
 */
export async function createEmbedding(text: string) {
  console.log("\n\n embstart\n");
  try {
    // Using the updated Google AI API format
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [text],
      config: {
        outputDimensionality: 768, // You can adjust this based on your needs
      },
    });
    console.log("\n\n Result");
    console.log(result);
    console.log("\n\n Result embedding\n");
    console.log(result.embeddings?.values);

    if (!result || !result.embeddings) {
      return;
    }
    console.log("\n\nResposnseme", result);

    const embedding = result.embeddings?.values();

    const contents = Array.from(embedding);
    console.log("content values");

    return contents[0].values;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

/**
 * Process document: chunk, embed, and store in database
 */
export async function processDocument(documentId: number): Promise<void> {
  console.log("processdocs\n\n");
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Create a single embedding job for the entire document
    const chunksContent = splitDocumentIntoChunks(document.content);
    const totalChunks = chunksContent.length;

    const [embeddingJob] = await db
      .insert(embeddingJobs)
      .values({
        documentId: document.id,
        userId: document.userId,
        status: "pending",
        totalChunks: totalChunks,
        processedChunks: 0,
        sourceType: document.sourceType || "unknown",
        progress: 0,
      })
      .returning();

    try {
      let processedCount = 0;
      let errorCount = 0;

      // Process chunks in sequence to maintain order
      for (let i = 0; i < chunksContent.length; i++) {
        const chunkText = chunksContent[i];
        const startChar = i * (CHUNK_SIZE - CHUNK_OVERLAP);
        const endChar = Math.min(
          startChar + CHUNK_SIZE,
          document.content.length
        );

        try {
          const embedding = await createEmbedding(chunkText);

          await db.insert(chunk).values({
            documentId: document.id,
            textContent: chunkText,
            orderInDocument: i,
            embeddings: embedding,
            metadata: {
              startChar,
              endChar,
            },
          });

          processedCount++;
        } catch (error) {
          console.error(`Error processing chunk ${i}:`, error);
          errorCount++;
        }

        // Update job progress
        const progress = Math.round((processedCount / totalChunks) * 100);
        await db
          .update(embeddingJobs)
          .set({
            processedChunks: processedCount,
            progress: progress,
            updatedAt: new Date(),
          })
          .where(eq(embeddingJobs.id, embeddingJob.id));
      }

      // Final job status update
      const finalStatus = errorCount > 0 ? "partial" : "completed";
      await db
        .update(embeddingJobs)
        .set({
          status: finalStatus,
          progress: 100,
          completedAt: new Date(),
          updatedAt: new Date(),
          ...(errorCount > 0 && { error: `${errorCount} chunks failed` }),
        })
        .where(eq(embeddingJobs.id, embeddingJob.id));

      // Update document status only if all chunks succeeded
      if (errorCount === 0) {
        await db
          .update(documents)
          .set({ processingStatus: "completed" })
          .where(eq(documents.id, documentId));
      }

      console.log(
        `✅ Document ${documentId} processed with ${errorCount} errors`
      );
    } catch (error) {
      await db
        .update(embeddingJobs)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(embeddingJobs.id, embeddingJob.id));

      throw error;
    }
  } catch (error) {
    console.error(`❌ Error processing document ${documentId}:`, error);
    await db
      .update(documents)
      .set({
        processingStatus: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      .where(eq(documents.id, documentId));

    throw error;
  }
}
