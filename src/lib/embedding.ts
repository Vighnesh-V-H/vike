import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const EMBEDDING_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 140,
  BATCH_SIZE: 10,
  RETRY_LIMIT: 3,
  BASE_DELAY_MS: 1000,
};


declare global {
  var embeddingQueue: Array<{
    text: string;
    resolve: (value: number[]) => void;
    reject: (reason?: unknown) => void;
  }>;
  var isProcessing: boolean;
  var requestCount: number;
  var lastRequestTime: number;
}

globalThis.embeddingQueue = globalThis.embeddingQueue || [];
globalThis.isProcessing = globalThis.isProcessing || false;
globalThis.requestCount = globalThis.requestCount || 0;
globalThis.lastRequestTime = globalThis.lastRequestTime || 0;

async function processEmbeddingQueue() {
  if (globalThis.isProcessing || globalThis.embeddingQueue.length === 0) return;

  globalThis.isProcessing = true;

  try {
    while (globalThis.embeddingQueue.length > 0) {
      // Rate limit check
      const now = Date.now();
      if (
        now - globalThis.lastRequestTime <
        60000 / EMBEDDING_CONFIG.MAX_REQUESTS_PER_MINUTE
      ) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            60000 / EMBEDDING_CONFIG.MAX_REQUESTS_PER_MINUTE -
              (now - globalThis.lastRequestTime)
          )
        );
      }

      const batch = globalThis.embeddingQueue.splice(
        0,
        EMBEDDING_CONFIG.BATCH_SIZE
      );
      const texts = batch.map((item) => item.text);

      let attempts = 0;
      while (attempts < EMBEDDING_CONFIG.RETRY_LIMIT) {
        try {
          const result = await genAI.models.embedContent({
            model: "text-embedding-004",
            contents: { text: texts[0] }, // Process first item in batch
            config: { outputDimensionality: 768 },
          });

          if (!result.embeddings) {
            throw new Error("Embeddings not found");
          }

          const embedding = result.embeddings[0].values;
          if (!embedding) throw new Error("Embedding values not found");

          batch[0].resolve(embedding);

          globalThis.requestCount++;
          globalThis.lastRequestTime = Date.now();
          break;
        } catch (error) {
          attempts++;
          if (attempts >= EMBEDDING_CONFIG.RETRY_LIMIT) {
            batch.forEach((item) => item.reject(error));
            break;
          }
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              EMBEDDING_CONFIG.BASE_DELAY_MS * Math.pow(2, attempts)
            )
          );
        }
      }
    }
  } finally {
    globalThis.isProcessing = false;
  }
}

export async function createEmbedding(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    globalThis.embeddingQueue.push({ text, resolve, reject });

    if (!globalThis.isProcessing) {
      processEmbeddingQueue().catch((error) => {
        console.error("Embedding queue error:", error);
      });
    }
  });
}
