import { NextResponse } from "next/server";
import { safeFetch, getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const res = await safeFetch(`/api/library?type=${type}`, {
      
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const data = await request.json();

  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const res = await safeFetch(`/api/library?type=${type}`, {
      method: "POST",
      
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
