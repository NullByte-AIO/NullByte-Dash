import { NextResponse } from "next/server";
import { getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET() {
  try {
    const res = await fetch(getBackendUrl("/api/emoji-categories"), {
      headers: getHeaders(),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch emoji categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const categories = await request.json();
    const res = await fetch(getBackendUrl("/api/emoji-categories"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(categories),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emoji categories" }, { status: 500 });
  }
}
