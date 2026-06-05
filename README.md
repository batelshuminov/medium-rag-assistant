# Medium RAG Assistant

## Course Project

**AI Agent Systems (00960237)**
Faculty of Data and Decision Sciences
Technion – Israel Institute of Technology
Spring 2026

---

## Overview

This project implements a Retrieval-Augmented Generation (RAG) system for answering questions over a collection of Medium articles.

The system combines semantic retrieval using vector embeddings with large language model generation. Relevant article passages are retrieved from a Pinecone vector database and supplied as context to the language model, allowing responses to be grounded in the underlying dataset.

The application is designed to reduce hallucinations by restricting generated answers to information contained in the retrieved article passages.

---

## System Architecture

1. A user submits a natural language question.
2. The question is converted into a vector embedding using OpenAI Embeddings.
3. Pinecone performs similarity search over the indexed article chunks.
4. The most relevant passages are selected and assembled into an augmented prompt.
5. GPT generates a response based exclusively on the retrieved context.
6. The system returns both the generated answer and the supporting sources.

---

## Technologies

* Next.js
* TypeScript
* OpenAI API
* Pinecone Vector Database
* Tailwind CSS

---

## Core Functionality

### Semantic Retrieval

Questions are matched against article content using vector similarity search rather than keyword matching.

### Grounded Question Answering

Responses are generated only from retrieved article passages.

### Article Discovery

The system can identify articles, titles, URLs, and other metadata that appear in the indexed dataset.

### Summarization

Users can request summaries of individual articles or article topics.

### Comparative Analysis

Information retrieved from multiple articles can be compared and synthesized into a single answer.

### Out-of-Scope Detection

When the retrieved context does not contain sufficient information to answer a question, the system returns a predefined fallback response rather than generating unsupported content.

---

## Dataset Processing

Articles are loaded from a CSV dataset and divided into overlapping text chunks.

Each chunk is embedded using OpenAI's embedding model and stored in Pinecone together with article metadata, including:

* Title
* Author(s)
* URL
* Tags
* Publication timestamp

---

## Retrieval Configuration

| Parameter                   | Value |
| --------------------------- | ----- |
| Chunk Size                  | 512   |
| Overlap Ratio               | 20%   |
| Retrieved Documents (Top-K) | 7     |

---

## Environment Variables

The application requires the following environment variables:

```env
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
```

---

## Running the Application

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## Dataset Ingestion

To load article embeddings into Pinecone:

```bash
npx tsx scripts/ingest.ts
```

---

## Example Queries

* Summarize the main idea of an article.
* Compare two articles discussing a common topic.
* Find an article matching a textual description.
* Return article titles related to a specific theme.
* Retrieve article URLs from the dataset.
* Answer questions based on article content.

---

## Author

Bat-El Shuminov

Course:
AI Agent Systems (00960237)

Faculty of Data and Decision Sciences

M.Sc. in Electrical and Computer Engineering

Technion – Israel Institute of Technology

Spring 2026