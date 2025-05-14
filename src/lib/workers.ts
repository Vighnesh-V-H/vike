"use server";
import { Job } from "bullmq";
import { QUEUE_NAMES, createWorker, createQueue } from "@/lib/queue";
import { processDocument } from "@/lib/docProcessor";

// Interface for document processing job data
interface DocumentProcessingJob {
  documentId: number;
}

/**
 * Worker to process documents asynchronously
 */
export async function startDocumentProcessingWorker() {
  // Create scheduler for the queue
  const scheduler = createQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);

  // Create the worker
  const worker = createWorker(
    QUEUE_NAMES.DOCUMENT_PROCESSING,
    async (job: Job<DocumentProcessingJob>) => {
      const { documentId } = job.data;

      console.log(`🔄 Processing document: ${documentId} (Job ID: ${job.id})`);

      try {
        // Process the document
        await processDocument(documentId);

        // Log success
        console.log(
          `✅ Document ${documentId} processing completed successfully`
        );
        return { success: true, documentId };
      } catch (error) {
        // Log error
        console.error(`❌ Error processing document ${documentId}:`, error);
        throw error; // Re-throw to let BullMQ handle retries
      }
    },
    {
      // Configure concurrency - how many jobs to process at once
      concurrency: 2,

      // Configure retry strategy
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000, // 5 seconds initial delay
      },
    }
  );

  // Handle worker events
  worker.on("completed", (job: Job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job: Job | undefined, error: Error, prev: string) => {
    if (job) {
      console.error(`❌ Job ${job.id} failed:`, error);
    } else {
      console.error("❌ Job failed:", error);
    }
  });

  worker.on("error", (error: Error) => {
    console.error("Worker error:", error);
  });

  console.log(`🚀 Document processing worker started`);

  return { worker, scheduler };
}
