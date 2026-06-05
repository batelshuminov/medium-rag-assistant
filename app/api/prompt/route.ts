import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { RAG_CONFIG } from "@/lib/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

const SYSTEM_PROMPT = `
You are a Medium-article assistant that answers questions strictly and only
based on the Medium articles dataset context provided to you.

You must not use external knowledge, the open internet, or information that is
not explicitly written in the retrieved context.

If none of the retrieved context contains relevant information, respond exactly:
"I don't know based on the provided Medium articles data."

Rules:
- Use only the retrieved article titles, URLs, and passages.
- Never mention Article IDs.
- Never mention relevance scores.
- Do not invent article titles, authors, URLs, facts, names, studies, numbers, or details.
- If author information is not shown in the retrieved context, say it is not provided.
- When comparing articles, refer to articles by their titles only.
- When asked to return only titles, return only the titles and no explanation.
- When asked for an exact number of results, return exactly that number if the context supports it.
- If several retrieved chunks come from the same article, treat them as one article.
- Always ground the answer in the retrieved passages.
- Do not include URLs in summaries unless the user explicitly asks for them.
`;

type RetrievedContext = {
  article_id: string;
  title: string;
  url: string;
  chunk: string;
  score: number;
};

async function queryPineconeWithRetry(questionEmbedding: number[]) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await index.query({
        vector: questionEmbedding,
        topK: Math.max(RAG_CONFIG.top_k * 3, 15),
        includeMetadata: true,
      } as any);
    } catch (error) {
      lastError = error;
      console.log(`Pinecone query failed. Attempt ${attempt}/3`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError;
}

function uniqueByArticle(matches: any[]): RetrievedContext[] {
  const seen = new Set<string>();
  const unique: RetrievedContext[] = [];

  for (const match of matches) {
    const articleId = String(match.metadata?.article_id || "");
    const title = String(match.metadata?.title || "");
    const url = String(match.metadata?.url || "");

    const key = articleId || title;

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);

    unique.push({
      article_id: articleId,
      title,
      url,
      chunk: String(match.metadata?.chunk || ""),
      score: Number(match.score || 0),
    });

    if (unique.length >= RAG_CONFIG.top_k) {
      break;
    }
  }

  return unique;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question) {
      return NextResponse.json(
        { error: "Missing question" },
        { status: 400 }
      );
    }

    const embeddingResult = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const questionEmbedding = embeddingResult.data[0].embedding;

    const searchResult = await queryPineconeWithRetry(questionEmbedding);

    const context = uniqueByArticle(searchResult.matches || []);

    const userPrompt = `
Question:
${question}

Retrieved Medium article context:
${context
  .map(
    (item, index) => `
[Context ${index + 1}]
Title: ${item.title}
URL: ${item.url}

Passage:
${item.chunk}
`
  )
  .join("\n")}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
      context,
      Augmented_prompt: {
        System: SYSTEM_PROMPT,
        User: userPrompt,
      },
    });
  } catch (error: any) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}