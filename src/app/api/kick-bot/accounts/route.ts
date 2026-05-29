import { NextResponse } from "next/server";
import { getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET() {
  try {
    const res = await fetch(getBackendUrl("/api/accounts"), {
      headers: getHeaders(),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDatabase = await request.json();
    const res = await fetch(getBackendUrl("/api/accounts"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newDatabase),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
  }
}
