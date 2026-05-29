import { NextResponse } from "next/server";
import { safeFetch } from "@/lib/kickbot-logger";

export async function GET() {
  try {
    const res = await safeFetch("/api/config", { cache: "no-store" });
    if (res.status === 503) {
      return NextResponse.json({ status: "offline" }, { status: 503 });
    }
    return NextResponse.json({ status: "online" });
  } catch (error) {
    return NextResponse.json({ status: "offline" }, { status: 503 });
  }
}
