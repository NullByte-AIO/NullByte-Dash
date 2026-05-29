import { NextResponse } from "next/server";
import { safeFetch, getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET() {
  try {
    const res = await safeFetch("/api/emojis", {
      
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read emojis" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newEmojis = await request.json();
    const res = await safeFetch("/api/emojis", {
      method: "POST",
      
      body: JSON.stringify(newEmojis),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emojis" }, { status: 500 });
  }
}
