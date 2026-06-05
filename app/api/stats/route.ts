import { NextResponse } from "next/server";
import { RAG_CONFIG } from "@/lib/config";

export async function GET() {
  return NextResponse.json(RAG_CONFIG);
}