import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import csv from "csv-parser";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { chunkText } from "../lib/chunk";

type Article = {
  title: string;
  text: string;
  url: string;
  authors: string;
  timestamp: string;
  tags: string;
};

const csvPath = path.join(process.cwd(), "data", "medium-english-50mb.csv");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

async function embedText(text: string) {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return result.data[0].embedding;
}

async function main() {
  const articles: Article[] = [];

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      articles.push(row);
    })
    .on("end", async () => {
      console.log(`Loaded ${articles.length} articles`);

      let uploadedChunks = 0;
      let batch: any[] = [];

      for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
        const article = articles[articleIndex];
        const chunks = chunkText(article.text || "");

        if (chunks.length === 0) {
          console.log(`Skipping article ${articleIndex} - no chunks`);
          continue;
        }

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex];

          const embeddingInput = `
Title: ${article.title}
Authors: ${article.authors}
Tags: ${article.tags}
Text: ${chunk}
`;

          const embedding = await embedText(embeddingInput);

          batch.push({
            id: `${articleIndex}-${chunkIndex}`,
            values: embedding,
            metadata: {
              article_id: String(articleIndex),
              title: article.title || "",
              authors: article.authors || "",
              url: article.url || "",
              timestamp: article.timestamp || "",
              tags: article.tags || "",
              chunk,
            },
          });

          uploadedChunks++;

          if (batch.length >= 50) {
            await index.upsert({ records: batch });
            console.log(`Uploaded chunks so far: ${uploadedChunks}`);
            batch = [];
          }
        }
      }

      if (batch.length > 0) {
        await index.upsert({ records: batch });
      }

      console.log(`Done uploading to Pinecone`);
      console.log(`Total uploaded chunks: ${uploadedChunks}`);
    });
}

main();