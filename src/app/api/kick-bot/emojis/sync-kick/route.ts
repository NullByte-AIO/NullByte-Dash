import { NextResponse } from "next/server";
import { safeFetch } from "@/lib/kickbot-logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // body contains { emotes: [...], channel: string } sent from the browser
    const res = await safeFetch("/api/emojis/sync-kick", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
