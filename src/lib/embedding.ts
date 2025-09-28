export async function createEmbedding(text: string): Promise<number[]> {
  console.warn("Embedding generation is disabled; returning an empty vector.", {
    textPreview: text?.slice(0, 50),
  });
  return [];
}

/*
Original embedding pipeline (commented out for RAG removal testing):

...existing code...

*/
