// lib/chunkUtils.ts

/**
 * Split text into chunks with overlap
 */
export function splitDocumentIntoChunks(
  content: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = start + chunkSize;
    chunks.push(content.slice(start, end));

    // Move start position, accounting for overlap
    start = end - chunkOverlap;

    // Prevent infinite loop on small content
    if (end >= content.length) break;
  }

  return chunks;
}
