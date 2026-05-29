import { NextResponse } from "next/server";
import { safeFetch, getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await safeFetch("/api/fetch-streamer", {
      method: "POST",
      
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Fetch Streamer Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
