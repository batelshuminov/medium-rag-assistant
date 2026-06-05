import { RAG_CONFIG } from "./config";

export function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);

  const chunkSize = RAG_CONFIG.chunk_size;
  const overlap = Math.floor(chunkSize * RAG_CONFIG.overlap_ratio);
  const step = chunkSize - overlap;

  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += step) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.length > 100) {
      chunks.push(chunk);
    }
  }

  return chunks;
}