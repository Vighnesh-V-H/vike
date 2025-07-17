import { Worker } from "bullmq";
import IORedis from "ioredis";
import { processDocument } from "@/lib/docProcessor";

const connection = new IORedis(process.env.REDIS_DATABASE_URL!, {
  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: null,
});

let workerInstance: Worker | null = null;

export function startWorker() {
  if (!workerInstance) {
    workerInstance = new Worker(
      "document-processing",
      async (job) => {
        const { documentId } = job.data;
        console.log(`Processing document ${documentId}`);
        await processDocument(documentId);
      },
      {
        connection,
        limiter: { max: 5, duration: 1000 },
        useWorkerThreads: false,
      }
    );

    connection.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    workerInstance.on("completed", (job) => {
      console.log(`Document ${job.data.documentId} processed successfully`);
    });

    workerInstance.on("failed", (job, err) => {
      console.error(`Document ${job?.data.documentId} failed:`, err);
    });

    console.log("📚 Worker started");
  }
  return workerInstance;
}
