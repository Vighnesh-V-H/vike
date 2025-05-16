// lib/queue/queue.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

// Export the Redis connection
export const connection = new IORedis(process.env.REDIS_DATABASE_URL!, {
  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: null,
});

export const documentQueue = new Queue("document-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});
