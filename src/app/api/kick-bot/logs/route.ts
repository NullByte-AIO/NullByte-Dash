import { NextResponse } from "next/server";
import { safeFetch, getBackendUrl, getHeaders } from "@/lib/kickbot-logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const category = searchParams.get("category");
  const listDates = searchParams.get("listDates");
  const download = searchParams.get("download");

  try {
    // Build query string for the backend
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (category) params.set("category", category);
    if (listDates) params.set("listDates", listDates);
    if (download) params.set("download", download);

    const res = await safeFetch(`/api/logs?${params.toString()}`, {
      
      cache: "no-store",
    });

    // Handle download (plain text response)
    if (download) {
      const content = await res.text();
      return new NextResponse(content, {
        headers: {
          "Content-Disposition": res.headers.get("Content-Disposition") || `attachment; filename="kickbot_logs.txt"`,
          "Content-Type": "text/plain",
        },
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Logs API Error:", error);
    return NextResponse.json({ error: "Failed to process logs" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const res = await safeFetch("/api/logs", {
      method: "DELETE",
      
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear today's logs" }, { status: 500 });
  }
}
