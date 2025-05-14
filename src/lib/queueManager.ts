"use server";
import { QUEUE_NAMES, createQueue } from "@/lib/queue";

// Create queues
const documentProcessingQueue = createQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);

/**
 * Add a document to the processing queue
 */
export async function queueDocumentProcessing(
  documentId: number
): Promise<string> {
  console.log(documentId);
  const job = await documentProcessingQueue.add(
    "process-document",
    { documentId },
    {
      // Optional: set different priority levels based on document type or user tier
      priority: 10,
      // Optional: delay processing by X milliseconds
      delay: 0,
      // Optional: job options
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      // Optional: job can be kept in completed/failed state for 1 day
      removeOnComplete: 24 * 60 * 60 * 1000,
      removeOnFail: 24 * 60 * 60 * 1000,
    }
  );

  console.log(
    `📋 Document ${documentId} queued for processing (Job ID: ${job.id})`
  );

  return job.id as string;
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    documentProcessingQueue.getWaitingCount(),
    documentProcessingQueue.getActiveCount(),
    documentProcessingQueue.getCompletedCount(),
    documentProcessingQueue.getFailedCount(),
    documentProcessingQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}
