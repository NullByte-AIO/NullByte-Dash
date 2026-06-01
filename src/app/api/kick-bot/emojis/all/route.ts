import { NextResponse } from "next/server";
import { safeFetch } from "@/lib/kickbot-logger";

export async function DELETE(request: Request) {
  try {
    const res = await safeFetch("/api/emojis/all", {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete all emojis" }, { status: 500 });
  }
}
