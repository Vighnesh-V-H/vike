import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URI!);

// Queue names
export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: "document-processing",
};

// Create a queue with improved options
export function createQueue(name: string, opts = {}) {
  console.log("\nCreateQueu\n");

  return new Queue(name, {
    connection: redis,
    defaultJobOptions: {
      attempts: 3, // Retry jobs up to 3 times
      backoff: {
        type: "exponential",
        delay: 1000, // Start with 1 second delay
      },
      removeOnComplete: true, // Cleanup completed jobs
    },
    ...opts,
  });
}

export function createWorker(name: string, processor: any, opts: any = {}) {
  console.log("\n Creatework\n");

  return new Worker(name, processor, {
    connection: redis,
    concurrency: 5, // Process 5 jobs at a time
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 2, // Consider a job stalled after 2 checks
    ...opts,
  });
}

// Export shared connection
export { redis };
