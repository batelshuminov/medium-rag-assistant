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

## Live Demo

https://medium-rag-assistant-nine.vercel.app/

---

## System Architecture

1. A user submits a natural language question.
2. The question is converted into a vector embedding using OpenAI Embeddings.
3. Pinecone performs similarity search over indexed article chunks.
4. The most relevant passages are retrieved.
5. Retrieved passages are assembled into an augmented prompt.
6. GPT generates a grounded response using only the retrieved context.
7. The system returns both the answer and the supporting sources.

---

## Technologies

* Next.js
* TypeScript
* OpenAI API
* Pinecone Vector Database
* Tailwind CSS
* Vercel

---

## Core Functionality

### Semantic Retrieval

Questions are matched against article content using vector similarity search rather than keyword matching.

### Grounded Question Answering

Responses are generated only from retrieved article passages.

### Article Discovery

The system can identify article titles, URLs, authors, and related metadata from the indexed collection.

### Summarization

Users can request summaries of individual articles or specific topics.

### Comparative Analysis

Information from multiple retrieved articles can be compared and synthesized into a single response.

### Unknown-Answer Detection

When the retrieved context does not contain sufficient information, the system returns a predefined fallback response instead of generating unsupported content.

---

## Dataset

The system indexes a Medium article dataset (~50 MB) that is processed into semantic chunks and stored in Pinecone.

Dataset source:

[Medium Articles Dataset (Google Drive)](https://drive.google.com/file/d/1Ew_jepAilAiYHG7_TUIHpBISYlwEtQQq/view?usp=sharing&utm_source=chatgpt.com)

The dataset itself is intentionally excluded from the GitHub repository because of its size.

---

## Dataset Processing Pipeline

1. Load Medium articles from the CSV dataset.
2. Split article text into overlapping chunks.
3. Generate OpenAI embeddings for each chunk.
4. Store embeddings in Pinecone together with article metadata.

Stored metadata includes:

* Title
* URL
* Author(s)
* Tags
* Publication timestamp

---

## Retrieval Configuration

| Parameter       | Value |
| --------------- | ----- |
| Chunk Size      | 512   |
| Chunk Overlap   | 20%   |
| Top-K Retrieval | 7     |

---

## Configuration

The system uses environment variables for secure access to OpenAI and Pinecone services.

Required variables:

* OPENAI_API_KEY
* PINECONE_API_KEY
* PINECONE_INDEX_NAME

---

## Example Queries

* Find an article about introverted writers and provide its URL.
* Summarize a specific Medium article.
* Compare multiple articles discussing the same topic.
* Retrieve article titles related to a given theme.
* Answer questions using information from the indexed dataset.
* Return article URLs from the retrieved results.

---

## Example Behaviors

### Article Retrieval

**Question**

Find an article about introverted writers and provide its URL.

**Answer**

A Marketing Guide for Introverts

https://medium.com/the-write-brain/a-marketing-guide-for-introverted-writers-b97a1cdf427d

### Grounded Summarization

**Question**

Summarize the article "A Marketing Guide for Introverts".

**Answer**

The system retrieves the article content and generates a concise summary based solely on the retrieved passages.

### Unknown Question Handling

**Question**

What is the capital of France?

**Answer**

I don't know based on the provided Medium articles data.

---

## Repository

GitHub Repository:

[medium-rag-assistant repository](https://github.com/batelshuminov/medium-rag-assistant?utm_source=chatgpt.com)

---

## Author

Batel Shuminov

Course: AI Agent Systems (00960237)

Faculty of Data and Decision Sciences

M.Sc. in Electrical and Computer Engineering

Technion – Israel Institute of Technology

Spring 2026
