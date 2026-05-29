import { NextResponse } from "next/server";
import { getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function POST(request: Request) {
  try {
    const command = await request.json();
    const res = await fetch(getBackendUrl("/api/command"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(command),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send command" }, { status: 500 });
  }
}
