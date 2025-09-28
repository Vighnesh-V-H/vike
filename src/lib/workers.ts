// import { Worker } from "bullmq";
// import IORedis from "ioredis";
// import { processDocument } from "@/lib/docProcessor";

let workerInstance: null = null;

export function startWorker() {
  console.warn(
    "Document processing worker is disabled; no job will be started."
  );
  return workerInstance;
}

/*
Original implementation (commented out while RAG is disabled):

...existing code...

*/
