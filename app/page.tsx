"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);

    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnswer(
          data.details?.includes("Pinecone")
            ? "Could not reach Pinecone. Please try again."
            : data.error || "Something went wrong. Please try again."
        );
        return;
      }

      setAnswer(data.response);
      setSources(data.context || []);
    } catch (error) {
      setAnswer("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setQuestion("");
    setAnswer("");
    setSources([]);
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-900">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold">Medium RAG Assistant</h1>

        <p className="mb-6 text-zinc-600">
          Ask a question and the system will retrieve relevant Medium articles
          from Pinecone and generate an answer using OpenAI.
        </p>

        <textarea
          className="mb-4 h-32 w-full rounded-xl border border-zinc-300 p-4 outline-none focus:border-black"
          placeholder="Ask a question about the Medium articles..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={askQuestion}
            disabled={loading}
            className="rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching Medium articles..." : "Ask"}
          </button>

          <button
            onClick={clearAll}
            disabled={loading}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        {loading && (
          <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-900" />

              <h2 className="text-xl font-semibold text-blue-900">
                Searching the article database...
              </h2>
            </div>

            <p className="mt-3 text-blue-800">
              Retrieving relevant Medium articles from Pinecone and generating
              a grounded answer with OpenAI.
            </p>
          </section>
        )}

        {answer && !loading && (
          <section className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <h2 className="mb-3 text-xl font-semibold">Answer</h2>

            <pre className="whitespace-pre-wrap font-sans leading-7">
              {answer}
            </pre>
          </section>
        )}

        {sources.length > 0 && !loading && (
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">Retrieved Sources</h2>

            <div className="space-y-4">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {index + 1}. {source.title || "Untitled"}
                    </a>
                  ) : (
                    <p className="font-semibold">
                      {index + 1}. {source.title || "Untitled"}
                    </p>
                  )}

                  <p className="text-sm text-zinc-500">
                    Relevance score: {(Number(source.score) * 100).toFixed(1)}%
                  </p>

                  <p className="mt-2 line-clamp-4 text-sm text-zinc-700">
                    {source.chunk}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}