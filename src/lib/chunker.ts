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

    start = end - chunkOverlap;

    if (end >= content.length) break;
  }

  return chunks;
}
