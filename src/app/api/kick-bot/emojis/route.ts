import { NextResponse } from "next/server";
import { getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET() {
  try {
    const res = await fetch(getBackendUrl("/api/emojis"), {
      headers: getHeaders(),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read emojis" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newEmojis = await request.json();
    const res = await fetch(getBackendUrl("/api/emojis"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newEmojis),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emojis" }, { status: 500 });
  }
}
