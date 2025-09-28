// lib/queue/queue.ts (queue disabled)
// import { Queue } from "bullmq";
// import IORedis from "ioredis";

export const connection: null = null;

export const documentQueue = {
  add: async (...args: unknown[]) => {
    console.warn("Document queue is disabled; skipping job enqueue.", {
      payload: args,
    });
    return null;
  },
};

/*
Original implementation (commented for temporary RAG removal):

...existing code...

*/
