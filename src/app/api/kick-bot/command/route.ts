import { NextResponse } from "next/server";
import { safeFetch, getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function POST(request: Request) {
  try {
    const command = await request.json();
    const res = await safeFetch("/api/command", {
      method: "POST",
      
      body: JSON.stringify(command),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send command" }, { status: 500 });
  }
}
