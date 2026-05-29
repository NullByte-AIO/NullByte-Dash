import { NextResponse } from "next/server";
import { getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET() {
  try {
    const res = await fetch(getBackendUrl("/api/config"), {
      headers: getHeaders(),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newConfig = await request.json();
    const res = await fetch(getBackendUrl("/api/config"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newConfig),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
